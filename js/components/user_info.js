class UserInfo extends HTMLElement {

    static get observedAttributes() {
        return ['img', 'name', 'login', 'onremove'];
      }

    constructor() {
        super();
        
        // Create a shadow root
        const shadow = this.attachShadow({mode: 'open'});

        //create elements
        const container = document.createElement('div');
        container.setAttribute('class', 'user_container');

        const userImg = document.createElement('img');
        userImg.setAttribute('class', 'user_img')

        const userTextDiv = document.createElement('div');
        userTextDiv.setAttribute('class', 'user_text');

        const userLoginDiv = document.createElement('div');
        userLoginDiv.setAttribute('class', 'user_login');

        const userNameDiv = document.createElement('div');
        userNameDiv.setAttribute('class', 'user_name');

        const style = document.createElement('style');
        style.textContent = `
        .user_container {
            align-items: end;
            display: inline-flex;
            padding: 0.3rem;
            padding-right: 1.2rem;
        }
        
        .user_img {
            width: 30px;
            height: 30px;
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

        .user_remove {
            padding: 0;
            padding-left:0.2rem;
            border-width: 0;
        }
        .user_remove img {
            width: 15px;
            height: 15px;
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
        //   <div>
        //     <button class='user_remove'>
        //   </div>
        //</div>
        shadow.appendChild(container);
        container.appendChild(userImg);
        container.appendChild(userTextDiv);
        userTextDiv.appendChild(userLoginDiv);
        userTextDiv.appendChild(userNameDiv);
    }

    loginText() {
        return this.hasAttribute('login') ? this.getAttribute('login') : '';
    }

    onRemove() {
        const onRemoveScript = this.getAttribute('onremove');
        eval(onRemoveScript);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'name':
                updateName(this, newValue);
                break;
            case 'login':
                updateLogin(this);
                break;
            case 'img':
                updateImage(this, newValue);
                break;
            case 'onremove':
                updateOnRemove(this, newValue);
                break;
        }
    }
}

// Define the element
customElements.define('user-info', UserInfo);

function updateImage(elem, img) {
    const shadow = elem.shadowRoot;
    const userImg = shadow.querySelector('.user_container img');

    const defaultImgSrc = 'img/person.svg';
    let imgSource = img ?? defaultImgSrc;
    if (!imgSource || imgSource === 'null') {
        imgSource = defaultImgSrc;
    }
    userImg.setAttribute('src', imgSource);
}

function updateName(elem, name) {
    const shadow = elem.shadowRoot;
    const userNameDiv = shadow.querySelector('.user_name');

    let userName = name ?? '';
    if (!userName || userName === 'null') {
        userName = '';
    }
    userNameDiv.innerText = userName;
}

function updateLogin(elem) {
    const shadow = elem.shadowRoot;
    const userLoginDiv = shadow.querySelector('.user_login');
    
    userLoginDiv.innerText = elem.loginText();
}

function updateOnRemove(elem, onRemove) {
    const shadow = elem.shadowRoot;
    const container = shadow.querySelector('.user_container');
    let removeButton = shadow.querySelector('.user_remove');

    if (onRemove && !removeButton) {
        removeButton = document.createElement('button');
        removeButton.setAttribute('class', 'user_remove');
        removeButton.setAttribute('title', `Remove ${elem.loginText()}`);
        removeButton.onclick = () => {elem.onRemove()};
        const removeImg = document.createElement('img');
        removeImg.setAttribute('src', 'img/delete.svg');

        container.appendChild(removeButton);
        removeButton.appendChild(removeImg);
    }
    else if (!onRemove && removeButton) {
        container.removeChild(removeButton);
    }
}