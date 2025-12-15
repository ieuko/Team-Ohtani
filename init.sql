-- 既存テーブルの削除
DROP TABLE IF EXISTS subject_assignment CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;

-- 1. 教員テーブル
CREATE TABLE instructors (
    instructor_id SERIAL PRIMARY KEY,
    instructor_name VARCHAR(100) NOT NULL
);

-- 2. 科目テーブル
CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    academic_year INTEGER NOT NULL,
    grade INTEGER NOT NULL,
    department VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    subject_category VARCHAR(50),
    credit_type VARCHAR(50),
    credits INTEGER NOT NULL,
    class_format VARCHAR(50),
    registration_category VARCHAR(50)
);

-- 3. 割り当て中間テーブル
CREATE TABLE subject_assignment (
    assignment_id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
    instructor_id INTEGER REFERENCES instructors(instructor_id) ON DELETE CASCADE
);

-- データ登録
INSERT INTO instructors (instructor_name) VALUES 
('佐藤 先生'), ('鈴木 先生'), ('田中 先生');

INSERT INTO subjects (academic_year, grade, department, semester, subject_name, subject_category, credit_type, credits, class_format, registration_category) 
VALUES 
(2025, 4, '情報系', '前期', 'データベース工学', '専門科目', '学修', 2, '講義', '必修'),
(2025, 1, '全系共通', '通年', 'プログラミング基礎', '一般科目', '履修', 2, '演習', NULL),
(2025, 3, '情報系', '後期', '応用数学', '専門科目', '学修', 2, '講義', '選択');

INSERT INTO subject_assignment (subject_id, instructor_id) VALUES 
(1, 1), (2, 2), (3, 3);