import React from 'react';
import {Link,Route,Routes} from 'react-router-dom';
// Temporary route used while feature tickets are merged. VIA-209 replaces this file.
export function AppRoutes(){
  return <Routes>
    <Route path="*" element={
      <main className="starter-page">
        <h1>ViArena</h1>
        <p>The shared frontend is ready. Feature screens will be connected in VIA-209 after all tickets merge.</p>
      </main>
    }/>
  </Routes>
}