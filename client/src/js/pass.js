(()=> {
    const resetPasswordToken = location.search.split('?reset-password-token=')[1];
    const getElemById = (id) => document.getElementById(id);
    const resetPassForm = getElemById('reset-pass-form');
    const adminForm = getElemById('admin-form');

    
    adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const admin = getElemById('admin').value.trim();
        const password = getElemById('admin-password').value.trim();
        console.log(admin)
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
                localStorage.setItem('admin',admin);
                localStorage.setItem('password',password);
                getElemById('admin-section').classList.add('d-none');
                getElemById('create-user-section').classList.remove('d-none');
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
    getElemById('user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = getElemById('fname').value.trim();
        const lastName = getElemById('lname').value.trim();
        const email = getElemById('email').value.trim();
        const regNo = getElemById('reg-no').value.trim();
        const degreeCourse = getElemById('course').value.trim();
        const userPassword = getElemById('user-password').value.trim();
        const confirmPassword = getElemById('confirm-password').value.trim();
        console.log(localStorage.getItem('admin'))
        fetch('http://localhost:5000/auth/isAdmin', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization':`Basic ${ btoa(JSON.stringify({
                    name: localStorage.getItem('admin'),
                    password: localStorage.getItem('password') 
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
    resetPassForm.addEventListener('submit', (e) => {
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