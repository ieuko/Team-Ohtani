import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // 科目データを保存するための「状態 (state)」
  const [subjects, setSubjects] = useState([]);

  // 画面が表示された時に一度だけ実行される処理
  useEffect(() => {
    // バックエンド(API)からデータを取得
    axios.get('http://localhost:3001/api/subjects')
      .then(response => {
        // 取得成功！データをセットする
        setSubjects(response.data);
        console.log("Data loaded:", response.data);
      })
      .catch(error => {
        // エラー発生
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="App" style={{ padding: '20px' }}>
      <h1>一関高専 シラバスシステム</h1>
      
      {/* データがある場合のみ表を表示 */}
      {subjects.length > 0 ? (
        <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th>学年</th>
              <th>学科</th>
              <th>時期</th>
              <th>科目名</th>
              <th>区分</th>
              <th>単位</th>
              <th>担当教員</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.subject_id}>
                <td style={{ textAlign: 'center' }}>{subject.grade}</td>
                <td>{subject.department}</td>
                <td style={{ textAlign: 'center' }}>{subject.semester}</td>
                <td style={{ fontWeight: 'bold' }}>{subject.subject_name}</td>
                <td style={{ textAlign: 'center' }}>{subject.subject_category}</td>
                <td style={{ textAlign: 'center' }}>{subject.credits}</td>
                <td>{subject.instructor_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>データを読み込み中、またはデータがありません...</p>
      )}
    </div>
  );
}

export default App;
