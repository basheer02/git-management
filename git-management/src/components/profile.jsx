import { useState,useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

import Cookies from 'js-cookie';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 


export function Profile() {

    const [isOpen, setIsOpen] = useState(false);

    const [userData, setUserData] = useState(null);
    const [reposData, setReposData] = useState({});
    
      const handleToggle = (key) => {
        setReposData((prev) => ({
          ...prev,
          [key]: !prev[key], // Toggle the value for the specific key
        }));
        setIsChanged(true)
      };

    const handleClick = () => {
      setIsOpen(!isOpen);
    };

    const handleSave = async() => {

        const toastId = toast('auto review settings saving', {
            position: 'bottom-center',
            type: 'info',
            hideProgressBar: true,
            closeButton: false,
            theme: 'dark',                                                              
            style: {
                borderRadius: '10px',
            },
        });
        try {
            const response = await fetch('http://localhost:5000/auth/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: String(userData.id),       // User identifier, e.g., user ID from Firebase
                reposData: reposData,  // The review data you want to send
              }),
            });
        
            if (response.ok) {
                toast.update(toastId, {
                    render: 'Auto review settings successfully saved',
                    type: 'success',
                    autoClose: 1000,
                  })
                console.log('Review data updated successfully');
            } else {
                toast.update(toastId, {
                    render: 'Failed to save auto review settings, try again',
                    type: 'error',
                    autoClose: 1000,
                  })
              console.error('Failed to update review data');
            }
          } catch (error) {
            toast.update(toastId, {
                render: 'Failed to save auto review settings, try again',
                type: 'error',
                autoClose: 1000,
              })
            console.error('Error sending review data:', error);
          }
    };

    const [isChanged, setIsChanged] = useState(false);

    //console.log(toggles)

    const logout = async () => {
        try {
            const response = await fetch("http://localhost:5000/auth/logout", {
              method: "GET",
              credentials: 'include',// Ensures cookies are included in the request
            });
        
            if (response.ok) {
                sessionStorage.clear(); 
                Cookies.remove('connect.sid');
                // Redirect to login
                toast.success('logged out', {
                    position: 'bottom-center',
                    hideProgressBar: true,
                    closeButton: false,
                    theme: 'dark',                                                              
                    style: {
                        borderRadius: '10px',
                    },
                    autoClose: 1000,
                    onClose: () => {
                        window.location.href = "/";
                    }
                  })
            } else {
              console.error("Failed to log out");
            }
          } catch (error) {
            console.error("Error during logout:", error.message);
          }
    }

    useEffect(() => {
        fetch('http://localhost:5000/auth/getSession', {
          credentials: 'include',  // Ensure the session cookie is sent with the request
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('No session data');
            }
            return response.json();
          })
          .then((data) => {

            if (!sessionStorage.getItem('toastShown')) {
                toast.success(' login successfull', {
                    position: 'bottom-center',
                    hideProgressBar: true,
                    closeButton: false,
                    theme: 'dark',                                                              
                    style: {
                        borderRadius: '10px',
                    },
                    autoClose: 1000,
                });
            }
            sessionStorage.setItem('toastShown', 'true');
            setUserData(data)
            setReposData(data.repo)
            console.log(data)
            document.getElementById('username').textContent = `${data.username}`})
          .catch((error) => console.error('Error fetching session data:', error));
      }, []);

      //console.log(userData)

    return(
        <>
            <div className="w-screen h-screen bg-cover bg-center bg-gray-900"> {/* style={{ backgroundImage: "url('/bg.jpg')" }} */}
                <div className='flex bg-gray-900 p-4 shadow-lg shadow-gray-400/50'>
                    <h1 className='p-2 text-2xl font-mono font-extrabold text-gray-300'>GIT MANAGEMENT</h1>
                    <div className="fixed top-3 font-mono right-6 px-2">
                        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                        <div
                          className="cursor-pointer flex items-center justify-center bg-gray-700 text-white rounded-full p-2 hover:bg-gray-600 transition-all"
                          onClick={handleClick}>
                                <label className="m-2" id="username"/>
                                <FontAwesomeIcon icon={faUserCircle} className="text-2xl p-2" />
                        </div>

                        {/* Expanded Profile Info */}
                        {isOpen && (
                          <div className="fixed top-5 right-4 mt-16 bg-gray-800 text-white rounded-lg px-6 py-8 w-72 shadow-lg transition-all">
                            <label className="text-gray-400">name</label>
                            <div className="text-xl font-semibold mb-6">{userData.name}</div>
                            <label className="text-gray-400">Username</label>
                            <div className="text-md font-bold mb-4">{userData.username}</div>
                            <label className="text-gray-400">Email</label>
                            <div className="text-sm font-bold mb-8">{userData.email}</div>
                            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                            <button
                              className="w-full bg-green-800 hover:bg-red-700 text-white py-2 rounded-md"
                              onClick={() => logout() }
                            >
                              Logout
                            </button>
                          </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center p-4 mt-8">
                    <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Repositories</h2>
                        <div className="grid grid-cols-2 text-gray-700 font-medium mb-4">
                          <span className="px-4 ml-8">Name</span>
                          <span className="text-right mr-4">Auto Review</span>
                        </div>
                        <ul className="space-y-2">
                            {Object.keys(reposData).map((key) => (
                              <li
                                key={key}
                                className="flex justify-between items-center bg-gray-900 p-4 rounded-lg shadow-sm"
                              >
                                <span className="font-medium text-gray-200">{key}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={reposData[key]}
                                    onChange={() => handleToggle(key)}
                                    className="sr-only peer "
                                  />
                                  <div className="w-11 h-6 mr-1 bg-gray-300 rounded-full peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-700 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                                </label>
                              </li>
                            ))}
                        </ul>
                        <div className="m-3 ml-36 mt-4">
                            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                        <button
                          onClick={handleSave}
                          disabled={!isChanged}
                          className={`px-4 py-2 rounded shadow transition ${
                            isChanged
                              ? "bg-gray-900 text-white hover:bg-green-600"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Save Changes
                        </button>
                        </div>
                    </div>
                </div>
                <ToastContainer style={{ padding: '16px',}}/>
            </div>
        </>
    )
}