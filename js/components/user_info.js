class UserInfo extends HTMLElement {
    
    constructor() {
        super();
        
        // Create a shadow root
        const shadow = this.attachShadow({mode: 'open'});

        //create elements
        const container = document.createElement('div');
        container.setAttribute('class', 'user_container');

        const defaultImgSrc = 'img/person.svg';
        let imgSource = this.hasAttribute('img') ? this.getAttribute('img') : defaultImgSrc;
        if(!imgSource) {
            imgSource = defaultImgSrc;
        }
        const userImg = document.createElement('img');
        userImg.setAttribute('src', imgSource);

        const userTextDiv = document.createElement('div');
        userTextDiv.setAttribute('class', 'user_text');

        const userLogin = this.hasAttribute('login') ? this.getAttribute('login') : '';
        const userLoginDiv = document.createElement('div');
        userLoginDiv.setAttribute('class', 'user_login');
        userLoginDiv.innerText = userLogin;

        const userName = this.hasAttribute('name') ? this.getAttribute('name') : '';
        const userNameDiv = document.createElement('div');
        userNameDiv.setAttribute('class', 'user_name');
        userNameDiv.innerText = userName;

        const style = document.createElement('style');
        style.textContent = `
        .user_container {
            align-items: center;
            display: inline-flex;
            padding: 0.3rem;
            padding-right: 1.5rem;
        }
        
        .user_container img {
            width: 30px;
            border-radius: 50%;
        }
        
        .user_text {
            padding-left: 0.5rem;
        }
        
        .user_name {
            font-style: italic;
            font-size: small;
        }
        
        .user_name:not(:empty):before {
            content: '(';
        }
        
        .user_name:not(:empty):after {
            content: ')';
        }
        `;

        // Attach the created elements to the shadow dom
        shadow.appendChild(style);

        //<div class='user_container'>
        //   <img src='imgSource'>
        //   <div class='user_info'>
        //     <div class='user_login'>userLogin</div>
        //     <div class='user_name'>userName</div>
        //   </div>
        //</div>
        shadow.appendChild(container);
        container.appendChild(userImg);
        container.appendChild(userTextDiv);
        userTextDiv.appendChild(userLoginDiv);
        userTextDiv.appendChild(userNameDiv);
    }
}

// Define the element
customElements.define('user-info', UserInfo);