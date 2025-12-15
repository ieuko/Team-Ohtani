import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3001;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());

// PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ルート: 動作確認用
app.get('/', (req, res) => {
  res.send('Syllabus API is running!');
});

// 科目一覧取得API
app.get('/api/subjects', async (req, res) => {
  try {
    // 科目(subjects)テーブルを主軸に、教員名を配列にまとめて取得するクエリ
    const query = `
      SELECT 
        s.subject_id,
        s.grade,
        s.department,
        s.semester,
        s.subject_name,
        s.subject_category,      -- "専門" など
        s.registration_category, -- "必修" など
        s.credit_type,
        s.credits,
        s.class_format,
        s.classification,        -- "必履修" など
        s.syllabus_url,          -- URL
        -- 教員名を配列として集約して取得 (重複排除)
        array_remove(array_agg(DISTINCT i.instructor_name), NULL) as instructors
      FROM 
        subjects s
      LEFT JOIN 
        subject_assignment sa ON s.subject_id = sa.subject_id
      LEFT JOIN 
        instructors i ON sa.instructor_id = i.instructor_id
      GROUP BY
        s.subject_id
      ORDER BY 
        s.grade ASC, s.subject_id ASC;
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});