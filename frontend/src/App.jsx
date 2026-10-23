import React, { useState } from 'react';
import UploadZone from './components/UploadZone';
import StudyDashboard from './components/StudyDashboard';

function App() {
  const [currentMaterial, setCurrentMaterial] = useState(null);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {!currentMaterial ? (
        <UploadZone onMaterialLoaded={(data) => setCurrentMaterial(data)} />
      ) : (
        <StudyDashboard
          materialData={currentMaterial}
          onBackToUpload={() => setCurrentMaterial(null)}
        />
      )}
    </main>
  );
}

export default App;
