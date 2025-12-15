import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// __dirname の代わり (ES Modules用)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 データの登録を開始します...');

    // 1. JSONファイルの読み込み
    const jsonPath = path.join(__dirname, 'syllabas.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(rawData);

    // トランザクション開始 (失敗したら全部取り消せるようにする)
    await client.query('BEGIN');

    // 2. 既存データの削除 (外部キー制約があるため順番が重要)
    console.log('🗑️  既存データをクリア中...');
    await client.query('TRUNCATE subject_assignment, subjects, instructors RESTART IDENTITY CASCADE');

    // 3. Instructors (教員) の登録
    console.log(`👨‍🏫 教員データを登録中... (${data.instructors.length}件)`);
    for (const inst of data.instructors) {
      await client.query(
        'INSERT INTO instructors (instructor_id, instructor_name) VALUES ($1, $2)',
        [inst.instructor_id, inst.name]
      );
    }

    // 4. Subjects (科目) の登録
    console.log(`📚 科目データを登録中... (${data.subjects.length}件)`);
    for (const sub of data.subjects) {
      await client.query(
        `INSERT INTO subjects (
          subject_id, academic_year, grade, department, semester, 
          subject_name, subject_category, credit_type, credits, 
          class_format, registration_category
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          sub.subject_id,
          sub.year,            // JSON: year -> DB: academic_year
          sub.grade,
          sub.department,
          sub.term,            // JSON: term -> DB: semester
          sub.name,            // JSON: name -> DB: subject_name
          sub.classification,  // JSON: classification -> DB: subject_category
          sub.credit_type,
          sub.credits,
          sub.format,          // JSON: format -> DB: class_format
          sub.category         // JSON: category -> DB: registration_category
        ]
      );
    }

    // 5. Assignments (割り当て) の登録
    console.log(`🔗 割り当てデータを登録中... (${data.subject_assignment.length}件)`);
    for (const assign of data.subject_assignment) {
      await client.query(
        'INSERT INTO subject_assignment (assignment_id, subject_id, instructor_id) VALUES ($1, $2, $3)',
        [assign.assignment_id, assign.subject_id, assign.instructor_id]
      );
    }

    // 6. IDの自動採番(シーケンス)を更新
    // これをやらないと、次に新しいデータを追加するときに「IDが重複しています」というエラーが出ます
    await client.query("SELECT setval('instructors_instructor_id_seq', (SELECT MAX(instructor_id) FROM instructors))");
    await client.query("SELECT setval('subjects_subject_id_seq', (SELECT MAX(subject_id) FROM subjects))");
    await client.query("SELECT setval('subject_assignment_assignment_id_seq', (SELECT MAX(assignment_id) FROM subject_assignment))");

    // コミット (変更を確定)
    await client.query('COMMIT');
    console.log('✨ 全データの登録が完了しました！');

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ エラーが発生しました。変更を取り消します。', e);
  } finally {
    client.release();
    pool.end(); // 接続終了
  }
}

seed();