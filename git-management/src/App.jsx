import { useState } from 'react'
import './index.css'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

function App() {

  const handleLogin = (provider) => {
    toast.loading('redirecting...', {
      position: 'bottom-center',
      hideProgressBar: true,
      closeButton: false,
      theme: 'dark',                                                              
      style: {
          borderRadius: '10px',
      },
    })
    window.location.href = `http://localhost:5000/auth/${provider}`; // Redirect to backend
  };

  return (
    <>
      <div className="w-screen h-screen bg-cover bg-center" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <div className="flex justify-center items-center w-full h-full bg-black bg-opacity-50">
          <div className='items-center justify-center bg-gray rounded-lg p-8 px-12 shadow-lg shadow-gray-300/50'>
          <h2 className="text-white text-3xl mb-8 font-mono text-center">Login</h2>
            <div className="flex flex-col gap-5 w-full">
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button className="text-sm font-mono font-semibold bg-gray-800 text-white py-3 px-4 rounded-lg" onClick={() => handleLogin('github')}>Login using Github</button>
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button className="text-sm font-mono font-semibold bg-green-800 text-white py-3 px-4 rounded-lg" onClick={() => handleLogin('bitbucket')}>Login using BitBucket</button>
              </div>
          </div>
        </div>
        <ToastContainer style={{ padding: '16px',}}/>
      </div>
    </>
  )
}

export default App
