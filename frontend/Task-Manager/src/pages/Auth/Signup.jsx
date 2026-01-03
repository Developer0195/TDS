import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/Layouts/AuthLayout'
import { use } from 'react';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage';
import { validateEmail } from '../../utils/helper';

const Signup = () => {

  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");

  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle signup From Submit 
  const handleLogin = async (e) => {
    e.preventDefault();

    let profileImageUrl = ''

    if (!fullName) {
      setError("Please enter your fullname");
      return;
    }

    if (!validateEmail(email)) {
      setError('kindly enter a valid email address ');
      return;
    }
    if (!password) {
      setError("Kindly enter your pssword");
      return;
    }
    setError("");
    //Sign up API call  API call
    try {

      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic)
        profileImageUrl = imgUploadRes.imageUrl || ""
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl: profileImageUrl,
        adminInviteToken
      });

      const { token, role } = response.data;


      if (token) {
        localStorage.setItem("token", token);
        console.log(token)
        updateUser(response.data);

        // Redirect based on role
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }


  };

  return (
    <AuthLayout>
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Create an account</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>Join us today by entering your details below</p>

        <form onSubmit={handleLogin}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name "
              placeholder='John Cena'
              type='text'
            />

            <Input value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="Johncena@gmail.com"
              type="text"
            />

            <Input value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Password"
              placeholder="Minimum 8 charecters required :) "
              type="password"
            />

            <Input value={adminInviteToken}
              onChange={({ target }) => setAdminInviteToken(target.value)}
              label="Admin Invite Token "
              placeholder="6 charecters required :) "
              type="text"
            />
          </div>
          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

          <button type="submit" className='btn-primary'>
            Sign Up
          </button>
          <p className='text-[13px] text-slate-800 mt-3'>
            Already having an account ? {" "}
            <Link className='font-medium text-primary-underline ' to="/login">Login </Link>
          </p>


        </form>



      </div>

    </AuthLayout>
  )
}

export default Signup