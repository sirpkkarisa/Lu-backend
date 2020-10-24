(()=> {
    const resetPasswordToken = location.search.split('?reset-password-token=')[1];
    const getElemById = (id) => document.getElementById(id);
    const resetPassForm = getElemById('reset-pass-form');
    const adminForm = getElemById('admin-form');

    
  return  adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const admin = getElemById('admin').value.trim();
        const password = getElemById('admin-password').value.trim();

        fetch('http://localhost:5000/auth/create-user', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization':`Basic ${ btoa(JSON.stringify({
                    name: admin,
                    password 
                }))}`
            })
        })
        .then((res) => res.json())
        .then((res)=> {
            if (res.status === 'success' && res.message === 'isAdmin') {
                sessionStorage.setItem('admin',admin);
                sessionStorage.setItem('password',password);
                getElemById('admin-section').style.display = 'none';
                getElemById('create-user-section').removeAttribute('style');
                return;
            }
            alert('Invalid Login');
        })
        .catch((err) => console.log(err))
    });
    let gender ='male';
    getElemById('gender').addEventListener('change',(e)=> {
        gender = e.target.value;
    })
    return getElemById('user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = getElemById('fname').value.trim();
        const lastName = getElemById('lname').value.trim();
        const email = getElemById('email').value.trim();
        const regNo = getElemById('reg-no').value.trim();
        const degreeCourse = getElemById('course').value.trim();
        const userPassword = getElemById('user-password').value.trim();
        const confirmPassword = getElemById('confirm-password').value.trim();
 	
 	if (firstName.length <1 || lastName.length < 1|| email.length <1 || regNo.length <1 || degreeCourse.length <1 || userPassword.length <1){
 		console.log('All fields are required');
 		return 'All fields are required';
 	}
 	if (userPassword.length < 6) {
 		console.log('Password is too short');
 		return 'Password is too short';
 	}
 	if (userPassword !== confirmPassword) {
 		console.log('Password mismatch');
 		return 'Password mismatch';
 	}
        fetch('http://localhost:5000/auth/isAdmin', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization':`Basic ${ btoa(JSON.stringify({
                    name: sessionStorage.getItem('admin'),
                    password: sessionStorage.getItem('password') 
                }))}`
            }),
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                regNo,
                password: userPassword,
                degreeCourse,
                gender
            })
        })
        .then((res) => res.json())
        .then((res)=> {
            console.log(res)
        })
        .catch((err) => console.log(err))
        
    })
   return resetPassForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassword = getElemById('new-password').value.trim();
         const confirmPassword = getElemById('confirm-password').value.trim();
        console.log(newPassword+'\n'+confirmPassword)
        if (!newPassword || !confirmPassword) {
            alert('All fields are required');
            return;
        }
        if (newPassword.length < 6) {
            alert('Password Is too short')
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('Password Mismatch')
            return;
        }
        if(resetPasswordToken.length !== 40) {
            alert('Please use secure Link to complete this process');
            return;
        }
        fetch('http://localhost:5000/auth/reset-password',{
            method: 'PATCH',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                password: newPassword,
                resetPasswordToken
            })
        })
        .then((res)=> res.json())
        .then((res)=> console.log(res))
        .catch((error)=> console.log(error))
    })
   })()
