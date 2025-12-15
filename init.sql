DROP TABLE IF EXISTS subject_assignment CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;

-- 1. 教員テーブル
CREATE TABLE instructors (
    instructor_id SERIAL PRIMARY KEY,
    instructor_name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. 科目テーブル (IDは自動採番)
CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,    -- ★ここをSERIALに戻しました
    grade INTEGER,
    department VARCHAR(100),
    semester VARCHAR(50),
    subject_name VARCHAR(200) NOT NULL,
    subject_category VARCHAR(100),
    registration_category VARCHAR(100),
    credit_type VARCHAR(50),
    credits INTEGER,
    class_format VARCHAR(50),
    classification VARCHAR(100),
    syllabus_url TEXT
);

-- 3. 割り当て中間テーブル
CREATE TABLE subject_assignment (
    assignment_id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
    instructor_id INTEGER REFERENCES instructors(instructor_id) ON DELETE CASCADE
);