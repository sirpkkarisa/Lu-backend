(()=> {
    //DOM Elements and their EVENTS
    const getElemById = (id) => (document.getElementById(id));
    const createElem = (elem) => document.createElement(elem);
    const url = `${location.protocol}//${location.host}/`;

    const formatDate = (dt) => {
            if (!dt) {
                return '--';
            }
            let date = new Date(dt).getUTCDate();
            let hours = new Date(dt).getHours();
            let minutes = new Date(dt).getMinutes();
            let month = new Date(dt).getUTCMonth()+1;
            let year = new Date(dt).getUTCFullYear();

            if (date === new Date().getUTCDate()) {
                return `Today, ${hours <= 9 ? '0'+hours: (hours % 10 === 0 ? hours+'0': hours)}:${minutes <= 9? '0'+minutes: minutes}`;
            }
            if ( (new Date().getUTCDate() - date) === 1) {
                return `Yesterday, ${hours <= 9 ? '0'+hours: hours}:${minutes <= 9? '0'+minutes: minutes}`;
            }
            return `${year}-${month <= 9?'0'+month: month}-${date < 10 ? '0'+date: date},${hours}:${minutes}`;
        }
    const init = async () => {
        try {
        await getData({method: 'GET'});
        } catch (error) {
            console.log(error)
        }
    }
    /*
        Handle Session Duration from the web token generated by the server
        if the time left is less than 0, then it shows that the token has expired thus removed from the localstorage
    */
if (localStorage.getItem('token')) {
    const timeLeft = (JSON.parse(atob(localStorage.getItem('token').split('.')[1])).exp - Date.now()/(1000))/60;
    if (timeLeft < 0 && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        location.reload();
        return;
    }
}
    
    let doc;
    getElemById('resource-file').addEventListener('change', (e) => {
        doc=e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const objElem = createElem('object');
            objElem.setAttribute('data', reader.result);
            getElemById('resource-form').appendChild(objElem);
        }
        reader.readAsDataURL(doc)
    });

    getElemById('resource-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('docTitle',doc.name);
        fd.append('authorId', localStorage.getItem('userId'));
        fd.append('document', doc, doc.name);
        getData({method: 'POST',fd});
    })
     getElemById('to-articles-section').addEventListener('click', (e) => {
        e.preventDefault();
        getElemById('articles-section').classList.remove('d-none');
        getElemById('articles-div').classList.remove('d-none');
        if (getElemById('articles-div').classList.value === 'articles-div') {
            getArticles();
        } 
        getElemById('resources-section').classList.add('d-none');
        getElemById('resources-div').classList.add('d-none');
        getElemById('article-item').classList.add('d-none');
        getElemById('chats-section').classList.add('d-none');
    });
      getElemById('to-resources-section').addEventListener('click',(e)=> {
        e.preventDefault();
        getElemById('resources-section').classList.remove('d-none');
        getElemById('resources-div').classList.remove('d-none');
        getElemById('articles-section').classList.add('d-none');
        getElemById('articles-div').classList.add('d-none');
        getElemById('article-item').classList.add('d-none');
        getElemById('chats-section').classList.add('d-none');
        getDocuments();
    });
      getElemById('to-chats-section').addEventListener('click',(e)=> {
        e.preventDefault();
        getElemById('chats-section').classList.remove('d-none');
        getElemById('articles-section').classList.add('d-none');
        getElemById('articles-div').classList.add('d-none');
        getElemById('resources-section').classList.add('d-none');
        getElemById('resources-div').classList.add('d-none');
        getElemById('article-item').classList.add('d-none');
        const socket = io.connect(url);
        const chatsDiv = getElemById('chats');
        const div = createElem('div');


        socket.emit('loggedIn',{userId: localStorage.getItem('userId')});
        socket.on('welcome', data=>{
            getElemById('chat-status').innerHTML=`${data.msg}`;
            setTimeout(() => {
            getElemById('chat-status').style.display = 'none';
        }, 2000);
        });
        getElemById('chat-input').addEventListener('keypress',(e)=>{

               if (e.target.value.trim() && e.keyCode ===13){
                    socket.emit('send-chat',{chat: e.target.value, authorId: localStorage.getItem('userId')});
                    return;
                }
            });
       
        socket.on('chats',({chats})=> {
            let conversation = '';

           chats.forEach((res,i)=> {
                if (localStorage.getItem('userId') && localStorage.getItem('userId') === res.author_id) {
                    conversation += `<div class='author' title='Author: ${i}'>${res.chat}</div>
                                    <small style='font-size: 7px' class='authorLeft'>${formatDate(res.created_on)}</small>
                    `;
                } else{
                    conversation += `<div class='conversation' title='Author: ${i}'>${res.chat}</div>
                                    <small style='font-size: 7px'>${formatDate(res.created_on)}</small>
                    `         
                }
            })
           chatsDiv.innerHTML = conversation;
        })
     socket.on('status',(data)=>{
            if (data.msg=='clear') {
                getElemById('chat-input').value = '';
                return;
            }
        })
      })
      getElemById('forgot-password-link').addEventListener('click',(e) => {
       e.preventDefault();
        getElemById('login-div').classList.add('d-none');
        getElemById('forgot-section').classList.remove('d-none');
        getElemById('forgot-pass-form').addEventListener('submit',(e) => {
            e.preventDefault();
            const email = getElemById('email').value.trim();
            if (!email) {
                console.log('No Email');
                return;
            }
            getData({ email, END_POINT: 'auth/forgot-password'});
        })

    });
     
    
    const getDocuments =async (id) => {
      await  getData({method: 'GET', END_POINT: 'documents'});
    }
     const getArticles =async () => {
      await  getData({method: 'GET', END_POINT: 'articles'});
    }
    const getArticle =async (dataId) => {
        if (!dataId) {
            return getElemById('the-article-div').innerHTML ='<article>Oooops!<br>Something went wrong, Try refreshing this page</article>'
        }
        await getData({method:'GET',articleId: dataId});
        getElemById('delete-icon').addEventListener('click',()=> {
             getData({method:'DELETE',articleId: dataId, authorId: localStorage.getItem('userId')});
        });
        getElemById('comment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const comment = getElemById('comment-input').value.trim();
            fetch(`${url}articles/${dataId}/comment`, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }),
                body: JSON.stringify({
                    authorId: localStorage.getItem('userId'),
                    comment,
                })
            })
            .then(
                (res) => res.json()
           
            )
            .then(
                (res) => {
                    if (res.status === 'success') {
                        return location.reload();
                    }
                    if (res.status === 'error') {
                        let  errorDiv = getElemById('error-div');
                       let errorStatus = getElemById('error-status');
                       errorStatus.innerHTML = `<h2>${res.error}</h2>
                                                <button type="button" id="reset-error">OK</button> 
                       `;
                       getElemById('reset-error').addEventListener('click',()=> {
                        errorDiv.setAttribute('style','display:none;');
                       });
                        errorDiv.removeAttribute('style');
                    }
                }
            )
            .catch(
                (error) => console.log(error)
            )
        })

        getElemById('btn-post').setAttribute('disabled',true)
        getElemById('edit-btn').addEventListener('click', (e) => {
            // console.log()
            getElemById('article-title').value = e.path[2].firstChild.nextSibling.getAttribute('article-title');
            getElemById('article').value = e.path[2].getAttribute('article-body')
            getElemById('btn-post').removeAttribute('disabled');
            getElemById('btn-post').textContent ='Update';
            getElemById('article-form').removeAttribute('aricle-form');
            getElemById('btn-post').addEventListener('click', () => {
                let articleId = dataId;
                let articleTitle = getElemById('article-title').value;
                let article = getElemById('article').value;
                let authorId = localStorage.getItem('userId');

                fetch(`${url}articles/${articleId}`, {
                    method: 'PATCH',
                    headers: new Headers({
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify({
                        authorId,
                        articleTitle,
                        article,
                    })
                }).
                then(res => res.json())
                .then(res => {
                    if (res.status === 'success') {
                        return location.reload();
                    }
                    if (res.status === 'error') {
                        let  errorDiv = getElemById('error-div');
                       let errorStatus = getElemById('error-status');
                       errorStatus.innerHTML = `<h2>${res.error}</h2>
                                                <button type="button" id="reset-error">OK</button> 
                       `;
                       getElemById('reset-error').addEventListener('click',()=> {
                        errorDiv.setAttribute('style','display:none;');
                       });
                        errorDiv.removeAttribute('style');
                    }
                })
                .catch(e => console.log(e));
            });
            
        })
    }
    getElemById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        let method = 'POST';
        const uid = getElemById('login-username').value.trim();
        const password = getElemById('login-password').value.trim();
        if (uid.length <1 || password.length <1) {
            getElemById('status')
            .innerHTML=`<span class="error">Invalid Login</span>`;
            return;
        }
        getData({uid,password, method})
    });
   getElemById('articles-div').addEventListener('click',async e=> {
                if (e.target.tagName === 'ARTICLE' || e.target.tagName === 'H5' || e.target.tagName === 'SMALL') {
                    const dataId = e.target.getAttribute('data-id');
                    getArticle(dataId);
                    getElemById('articles-div').classList.add('d-none');
                    getElemById('article-item').classList.remove('d-none');
                }            
            });
    getElemById('article-form').addEventListener('submit',async (e) => {
        e.preventDefault();
        let method = 'POST';
        const articleTitle = getElemById('article-title').value.trim();
        const article = getElemById('article').value.trim();
        const articleE = createElem('article');
        const h5 = createElem('h5');
        const small = createElem('small');
        if (articleTitle.length <1 || article.length <1) {
            getElemById('article-status')
            .innerHTML=`<span class="error">All fields are required!</span>`;
            return;
        }

        await getData({articleTitle,article, method, authorId: localStorage.getItem('userId')});
        articleE.setAttribute('name',localStorage.getItem('articleId'));
        articleE.innerHTML = `
                <h5>${localStorage.getItem('articleTitle')}</h5>
                ${localStorage.getItem('article')}
                <br>
                <small style='font-size: 7px;'>${formatDate(localStorage.getItem('createdOn'))}</small>
        `
        getElemById('articles-div').appendChild(articleE)

        getElemById('article-title').value = '';
        getElemById('article').value = '';
        getElemById('btn-post').removeAttribute('btn-post');
    });
    getElemById('change-password-link').addEventListener('click',(ev) => {
        ev.preventDefault();
         getElemById('login-div').classList.add('d-none');
         getElemById('change-section').classList.remove('d-none');
         getElemById('change-pass-form').addEventListener('submit', (e) => {
             e.preventDefault();
             const newPassword = getElemById('new-password').value.trim();
             const uid = getElemById('user-id').value.trim();
             const currentPassword = getElemById('current-password').value.trim();
             const confirmPassword = getElemById('confirm-password').value.trim();
             if (!newPassword || !currentPassword || !confirmPassword || !uid) {
                alert('All fields are required');
                return;
            }
            if (newPassword.length < 6) {
               let  errorDiv = getElemById('error-div');
               let errorStatus = getElemById('error-status');
               errorStatus.innerHTML = `<h2>Password Is too short</h2>
                                        <button type="button" id="reset-error">OK</button> 
               `;
               getElemById('reset-error').addEventListener('click',()=> {
                errorDiv.setAttribute('style','display:none;');
               });
                errorDiv.removeAttribute('style');
                return;
            }
            if (newPassword !== confirmPassword) {
                let  errorDiv = getElemById('error-div');
               let errorStatus = getElemById('error-status');
               errorStatus.innerHTML = `<h2>Password Mismatch</h2>
                                        <button type="button" id="reset-error">OK</button> 
               `;
               getElemById('reset-error').addEventListener('click',()=> {
                errorDiv.setAttribute('style','display:none;');
               });
                errorDiv.removeAttribute('style');
                return;
            }
           
            getData({ uid, currentPassword, newPassword, END_POINT: 'auth/change-password'});
         })
     });
    let END_POINT = 'auth/signin';
    
    let id =''
    if (id.length >1) {
        END_POINT =`${END_POINT}/${id}`;
    }else {
        END_POINT = END_POINT;
    }
   
    
    const makeGetRequest = (data)=> {
        return new Promise((resolve, reject)=> {
            const xhr = new XMLHttpRequest();
            let { method } = data;
            if (data === undefined) {
                method = 'GET'
            }
            if (data.END_POINT !== undefined && data.email !== undefined && data.END_POINT.includes('auth/forgot-password')) {
                method = 'PATCH';
                END_POINT = 'auth/forgot-password';
            }
            if (data.END_POINT !== undefined && data.END_POINT.includes('auth/change-password')) {
                method = 'PATCH';
                END_POINT = 'auth/change-password';
            }
            if (data.END_POINT !== undefined && data.END_POINT === 'documents') {
                END_POINT = 'documents';
                method = data.method;
            }
            if (data.END_POINT !== undefined && data.END_POINT === 'articles') {
                END_POINT = 'articles';
                method = data.method;
            }
            if (data.document !== undefined) {
                END_POINT = 'documents';
            }
            if (data.fd !== undefined) {
                data = data.fd;
            }
            if (data.articleId !== undefined && id.length < 36) {
                END_POINT= `${END_POINT}/${data.articleId}`;
            }
            if (data.authorId !== undefined && data.articleId !== undefined ) {
                END_POINT = `${END_POINT.split('/')[0]}/${END_POINT.split('/')[1]}`
            }
            
            if (data.method == 'POST' && data.authorId !== undefined && END_POINT.split('/')[1] !== undefined) {
                method = 'PATCH';
                console.log('hekk')
            }
            if (END_POINT.split('/').length > 2) {
                END_POINT = `${END_POINT.split('/')[0]}/${END_POINT.split('/')[2]}`;
            }
           // console.log(url)
		//REGEX for url = /^https?\:{1}\/{2}\w*|(\d{1,3}){3}\:\w*\/?/
            xhr.open(method,`${url}${END_POINT}`);
            xhr.onreadystatechange =() => {
                if(xhr.readyState === 4) {
                    if(xhr.status === 200 || xhr.status === 201){
                        resolve(JSON.parse(xhr.response))
                    }else{
                        reject(JSON.parse(xhr.response));
                    }
                }
            }
            if (method == 'POST' || method == 'PATCH' || method == 'DELETE') {

                if (data !== undefined) {
                    if (method == 'PATCH' && data.END_POINT.includes('auth')) {
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.send(JSON.stringify(data));
                        return;
                    }
                    if (method == 'POST' && END_POINT.includes('documents') ) {
                         xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                         xhr.send(data);
                        return;
                    }
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                if (Object.entries(data).length === 1) {
                    return;
                }	
                    xhr.send(JSON.stringify(data));
                }else {
                    reject('Cannot Send empty data')
                }
                return;
            }else if(method == 'GET') {
                xhr.send();
                return;
            }else {
                reject('Invalid method');
            }
        })
    } 
    if (localStorage.getItem('token')) {
        getElemById('login-div').style.display ='none';
        getElemById('main-section').removeAttribute('style');
        END_POINT = 'articles';
    }else {
        getElemById('main-section').style.display ='none';
        getElemById('main-section').setAttribute('hidden',true);
    }
    const getData = async (data)=> {
        try {
            const res = await makeGetRequest(data);
             if (res.message && res.message == "Password has been successfully changed") {
                document.location.reload();
            }
            if (res.data.token) {
                localStorage.setItem('userId',res.data.userId);
                localStorage.setItem('token',res.data.token);
                document.location.reload()
                return;
            }
            // let state =[];
            let docOutput ='';
            // let idArr = [];
            if (res.data.message && res.data.message === 'Article successfully deleted') {
                document.location.reload();
            }
            if (res.data && res.data.resetPasswordToken && res.data.message && res.data.message == 'Recovery Link Sent') {
                alert('Secure Link has been sent into your email')
            }
            if (res.data && res.data.message && res.data.message == "New article created!") {
                    localStorage.setItem('articleId', res.data.article[0].article_id);
                    localStorage.setItem('userId', res.data.article[0].author_id);
                    localStorage.setItem('articleTitle', res.data.article[0].article_title);
                    localStorage.setItem('article', res.data.article[0].article);
                    localStorage.setItem('createdOn', res.data.article[0].created_on);
                }
            if (res.data[0].doc_id !== undefined) {
                res.data.forEach((item) => {
                    if (item.doc_url === undefined) {
                        return
                    }
                    // idArr.push(item.doc_id)
                    if (item.doc_url.split('/')[4].split('.').lastIndexOf('pdf') !== -1) {
                        docOutput += `<div>
                             <a href=${item.doc_url} title=${item.doc_title} class="document">
                             <h5 class="item-title">${item.doc_title}<i id="delete-resource" class="close-icon">&times;</i></h5>
                                <object data="${item.doc_url}"></object>
                                <small style="font-size:7px;">${formatDate(item.created_on)}</small>
                                </a>
                    </div>`
                        return;
                    }
                    docOutput+= `<div>
                            <a href=${item.doc_url} title=${item.doc_title} class="document">
                             <h5 class="item-title">${item.doc_title} <i id="delete-resource" class="close-icon">&times;</i></h5>
                                <p>Not Browser Compatible File! Click to download</p>
                                <small style="font-size: 7px;">${formatDate(item.created_on)}</small>
                                </a>
                                </div>`;
                    
                })
                getElemById('resources-div').innerHTML = docOutput;
                // for (let i = 0; i < getElemById('resources-div').children.length; i++) {
                //     getElemById('resources-div').children[i].addEventListener('click', () => {
                //         getDocuments(idArr[i])                
                //     })
                // }
            }

            let articleOutput = '';
            const arrElem = [];
            if (res.data[0].article_id !== undefined) {
                res.data.forEach(element => {
                    articleOutput+=`<article data-id="${element.article_id}">
                    <h5 data-id="${element.article_id}">${element.article_title}</h5>
                    ${element.article}
                    <br>
                    <small style='font-size:7px;' data-id="${element.article_id}">${formatDate(element.created_on)}</small> 

                    </article>
                    `;
                });

             }
            getElemById('articles-div').innerHTML = articleOutput;

            if (data.articleId && data.articleId === res.data[0].article_id) {

            getElemById('the-article-div').innerHTML = `<article article-body="${res.data[0].article}">
            <h5 class="item-title" article-title="${res.data[0].article_title}">${res.data[0].article_title}<i id="delete-icon" class="close-icon">&times;</i></h5>
                    ${res.data[0].article}
                    <br>
                    <small style='font-size:7px;'>${formatDate(res.data[0].created_on)}</small>
                   <div class="input-div"> <buttton type="submit" class="edit-btn" id="edit-btn">Edit</button></div></article>`;
            
            let commentOutput = '<h4>Comments</h4>';
            let commentIDs = [];
            if (res.comments !== undefined) {
                if (res.comments.length > 0) {
                    res.comments.forEach(item => {
                        commentIDs.push(item.comment_id)
                        commentOutput+=`<article>
                        ${item.comment}
                        <br>
                        <small style='font-size:7px;'>${formatDate(item.created_on)}</small>
                        <i class="close-icon" id="delete-comment">&times;</i>
                        </article>`
                    })
                }
            }
            getElemById('comments').innerHTML = commentOutput;
            return;
        }
             
        } catch (res) {
            if (res.status === 'error') {
               let  errorDiv = getElemById('error-div');
               let errorStatus = getElemById('error-status');
               errorStatus.innerHTML = `<h2>${res.error}</h2>
                                        <button type="button" id="reset-error">OK</button> 
               `;
               getElemById('reset-error').addEventListener('click',()=> {
                errorDiv.setAttribute('style','display:none;');
               });
                errorDiv.removeAttribute('style');
                return;
            }
            if (res.error === 'No articles') {
                getElemById('articles-div').innerHTML = `<div>No Articles!<br>Be the first one to Post</div>`
                return;
            }
        }     
    } 
    if (END_POINT === 'auth/signin') {
        getData({method:'POST'});
        return;
    }
    init();
})()





















