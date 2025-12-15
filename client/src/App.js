import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [subjects, setSubjects] = useState([]);

  // 高専WebシラバスのベースURL
  const SYLLABUS_BASE_URL = "https://syllabus.kosen-k.go.jp/Pages/PublicSyllabus?school_id=06&";

  useEffect(() => {
    axios.get('http://localhost:3001/api/subjects')
      .then(response => {
        setSubjects(response.data);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>一関高専 シラバスシステム</h1>
      
      {subjects.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table border="1" style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px' }}>
            <thead style={{ backgroundColor: '#003366', color: 'white' }}>
              <tr>
                <th>学年</th>
                <th>時期</th>
                <th>分類</th>
                <th>科目名</th>
                <th>種別</th>
                <th>単位</th>
                <th>必修/選択</th>
                <th>担当教員</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.subject_id} style={{ backgroundColor: subject.grade % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={{ textAlign: 'center' }}>{subject.grade}</td>
                  <td style={{ textAlign: 'center' }}>{subject.semester}</td>
                  <td style={{ fontSize: '0.9em' }}>{subject.subject_category}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    {/* シラバスURLがある場合は、ベースURLと結合してリンクにする */}
                    {subject.syllabus_url ? (
                      <a 
                        href={`${SYLLABUS_BASE_URL}${subject.syllabus_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {subject.subject_name}
                      </a>
                    ) : (
                      subject.subject_name
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{subject.credit_type}</td>
                  <td style={{ textAlign: 'center' }}>{subject.credits}</td>
                  <td style={{ textAlign: 'center', color: subject.registration_category === '必修' ? 'red' : 'black' }}>
                    {subject.registration_category}
                  </td>
                  <td>
                    {subject.instructors && subject.instructors.length > 0 
                      ? subject.instructors.join(', ') 
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>データを読み込み中...</p>
      )}
    </div>
  );
}

export default App;