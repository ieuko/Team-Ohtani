import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 データの登録を開始します...');

    // JSON読み込み
    const jsonPath = path.join(__dirname, 'syllabus.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const subjectsData = JSON.parse(rawData);

    await client.query('BEGIN');

    // 既存データ削除
    console.log('🗑️  既存データをクリア中...');
    await client.query('TRUNCATE subject_assignment, subjects, instructors RESTART IDENTITY CASCADE');

    // ---------------------------------------------------------
    // 1. 教員データの抽出とマスタ登録
    // ---------------------------------------------------------
    console.log('👨‍🏫 教員データを解析・登録中...');
    
    const allInstructorNames = new Set();
    subjectsData.forEach(sub => {
      if (Array.isArray(sub.instructors)) {
        sub.instructors.forEach(name => allInstructorNames.add(name));
      }
    });

    const instructorMap = new Map();

    for (const name of allInstructorNames) {
      if (!name || name.trim() === "") continue;
      // 教員を登録し、生成されたIDを取得
      const res = await client.query(
        'INSERT INTO instructors (instructor_name) VALUES ($1) RETURNING instructor_id',
        [name]
      );
      instructorMap.set(name, res.rows[0].instructor_id);
    }

    // ---------------------------------------------------------
    // 2. 科目データの登録 (自動採番IDを使用)
    // ---------------------------------------------------------
    console.log(`📚 科目データを登録中... (${subjectsData.length}件)`);

    for (const sub of subjectsData) {
      // カテゴリ分解処理
      let subjCat = "";
      let regCat = "";
      if (sub.category) {
        const parts = sub.category.split('/').map(s => s.trim());
        if (parts.length > 0) subjCat = parts[0];
        if (parts.length > 1) regCat = parts[1];
      }

      // ★ポイント: IDを指定せずにINSERTし、RETURNINGで生成されたIDを受け取る
      const res = await client.query(
        `INSERT INTO subjects (
          grade, department, semester, 
          subject_name, subject_category, registration_category, 
          credit_type, credits, class_format, classification, syllabus_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING subject_id`, // <--- ここでIDを返してもらう
        [
          sub.grade,
          sub.department,
          sub.semester,
          sub.name,
          subjCat,
          regCat,
          sub.credit_type,
          parseInt(sub.credits) || 0,
          sub.class_style,
          sub.classification,
          sub.page
        ]
      );

      // データベースが発行した新しいID
      const newSubjectId = res.rows[0].subject_id;

      // ---------------------------------------------------------
      // 3. 割り当て (中間テーブル) の登録
      // ---------------------------------------------------------
      // 生成された newSubjectId を使って紐付けを行う
      if (Array.isArray(sub.instructors)) {
        for (const instructorName of sub.instructors) {
          const instructorId = instructorMap.get(instructorName);
          if (instructorId) {
            await client.query(
              'INSERT INTO subject_assignment (subject_id, instructor_id) VALUES ($1, $2)',
              [newSubjectId, instructorId]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('✨ 全データの登録が完了しました！');

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ エラーが発生しました', e);
  } finally {
    client.release();
    pool.end();
  }
}

seed();