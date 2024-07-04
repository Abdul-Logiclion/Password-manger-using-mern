import React, { useState ,useRef,useEffect} from 'react';
import svg from './icons/save.svg';
import visible from './icons/visible-eye-icon.svg'
import hidden from './icons/eye-hidden-icon.svg'
import { v4 as uuidv4 } from 'uuid';

function App() {

  const ref=useRef();
  const passwordRef=useRef();

  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setpasswordArray] = useState([]);
 
  useEffect(()=>{
    getPasswords();
      },[])

      const getPasswords = async () => {
        try {
          const response = await fetch('http://localhost:3005/api/backend/passwords');
    
          if (!response.ok) {
            throw new Error('Failed to fetch passwords');
          }
    
          const data = await response.json(); // Parse JSON response
          setpasswordArray([...data]);
        } catch (err) {
          console.error('Error fetching passwords:', err);
        }
      };
        
  const showPassword = () => {
    passwordRef.current.type = "text"
    console.log(ref.current.src)
    if (ref.current.src.includes(hidden)) {
        ref.current.src = visible
        passwordRef.current.type = "password"
    }
    else {
        passwordRef.current.type = "text"
        ref.current.src =hidden
    }

}

  const handleChage = (e) => {
    setForm({...form,[e.target.name]:e.target.value})
  };
  
  const handleSave = async () => {
    try {

      const isDuplicate = passwordArray.some((item) => item.site === form.site && item.username === form.username);

      const response = await fetch('http://localhost:3005/api/backend/passwords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to save password');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json(); // Parse JSON response
        console.log('Password saved:', data);
      } else {
        const text = await response.text(); // Read plain text response
        console.log('Password saved:', text); // Log the plain text response
      }
        
      
      if (!isDuplicate) {
        setpasswordArray([...passwordArray, { ...form, id: uuidv4() }]);
        setForm({ site: '', username: '', password: '' });
      } else {
        alert('Duplicate entry detected. Please enter a unique combination of site and username.');
      }
    } catch (error) {
      console.error('Error saving password:', error);
      alert('Failed to save password. Please try again.');
    }
  };


  const handleDelete = async (index) => {
    try {
      const response = await fetch('http://localhost:3005/api/backend/passwords/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordArray[index]),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete password');
      }
  
      const updatedPasswords = passwordArray.filter((item, idx) => idx !== index);
      setpasswordArray(updatedPasswords);
  
    } catch (error) {
      console.error('Error deleting password:', error);
      alert('Failed to delete password. Please try again.');
    }
  };
  

  const handleUpdate=(index)=>{
    
    const selectedPassword = passwordArray[index];
    setForm({
      site: selectedPassword.site,
      username: selectedPassword.username,
      password: selectedPassword.password,
    });
handleDelete(index);

  }
  return (
    <>
      <div className='bg-slate-900 h-11 w-full grid justify-center'>
        <span className='text-white content-around'>&lt; PassOP &gt;</span>
      </div>
      <main className='flex items-center mt-2 flex-col gap-3'>
        <span className='p-2 w-2/3 flex justify-center'>
          <input
            className='p-3 w-full border-2 border-slate-600'
            placeholder='Enter website URL'
            type="text"
            name="site"
            id="site"
            value={form.site}
            onChange={(e)=>{
            handleChage(e)
            }}
          />
        </span>
        <span className='p-2 w-2/3 flex gap-2 justify-normal'>
          <input
            className='p-3 w-4/6 border-2 border-slate-600'
            type="text"
            placeholder='Enter user name'
            name="username"
            id="username"
            value={form.username}
            onChange={(e)=>{
              handleChage(e)
              }}
          />
          <input
          ref={passwordRef}
            className='w-2/6 p-3 border-2 border-slate-600'
            type="text"
            name="password"
            id="password"
            placeholder='Enter password'
            value={form.password}
            onChange={(e)=>{
              handleChage(e)
              }}

          />

       <img ref={ref} className='p-1' width={26} src={visible} alt="eye" onClick={showPassword} />
                            
        </span>
        <span className='bg-green-800 p-3 flex items-center justify-center cursor-pointer' onClick={handleSave}>
          <img src={svg} className='h-6 w-6 mr-2' alt='Save Icon' />
          Save
        </span>
        
      </main>
      <div className="passwords">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    {passwordArray.length === 0 && <div> No passwords to show</div>}
                    {passwordArray.length != 0 && <table className="table-auto w-full rounded-md overflow-hidden mb-10">
                        <thead className='bg-green-800 text-white'>
                            <tr>
                                <th className='py-2'>Site</th>
                                <th className='py-2'>Username</th>
                                <th className='py-2'>Password</th>
                                <th className='py-2'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='bg-green-100'>
                      
                       {passwordArray.map((item, index) => {
                        return <tr key={index}>
                            <td className='py-2 border border-white text-center'>
                                <div className='flex items-center justify-center '>
                                <span>{item.site}</span>
                                    
                                </div>
                            </td>
                            <td className='py-2 border border-white text-center'>
                                <div className='flex items-center justify-center '>
                                    <span>{item.username}</span>

                                </div>
                            </td>
                            <td className='py-2 border border-white text-center'>
                                <div className='flex items-center justify-center '>
                                    <span>{"*".repeat(item.password.length)}</span>

                                </div>
                            </td>
                            <td className='justify-center py-2 border border-white text-center '>
                             <button className='bg-green-800 mx-2 rounded' onClick={()=>{handleUpdate(index)}}>Update </button>
                             <button className='bg-green-800 mx-2 rounded' onClick={()=>{handleDelete(index)}}>Delete</button>
                            </td>
                        </tr>
                    })}  
                </tbody>
              </table>
}
        </div>
      <div className='bg-slate-900 h-10 w-full fixed bottom-0 grid justify-center'>
        <span className='text-white content-around'>&lt; PassOP &gt;</span>
      </div>
    </>
  );
}

export default App;
