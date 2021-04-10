class SiteHeader extends HTMLElement {
    
    constructor() {
        super();
        
        // Create a shadow root
        const shadow = this.attachShadow({mode: 'open'});

        //create elements
        const wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'affiliation');

        const siteImg = document.createElement('img');
        siteImg.setAttribute('class', 'site_img');
        siteImg.setAttribute('width', 30);
        siteImg.setAttribute('height', 30);

        const siteTitle = document.createElement('span');
        siteTitle.setAttribute('class', 'site_title');

        const siteSelectLink = document.createElement('a');
        siteSelectLink.setAttribute('href', 'site_selection.html');
        siteSelectLink.textContent = 'change';

        const style = document.createElement('style');
        style.textContent = `
        .affiliation {
            float: right;
        }
        .site_img {
            vertical-align: middle;
        }
        .site_title {
            margin-left: 8px;
        }
        `;

        // Attach the created elements to the shadow dom
        shadow.appendChild(style);
        //<span class="affiliation"><img class="site_img" width="30" height="30">&nbsp;<span class="site_title"></span> (<a href="site_selection.html">change</a>) </span>
        shadow.appendChild(wrapper);
        wrapper.appendChild(siteImg);
        wrapper.appendChild(siteTitle);
        wrapper.innerHTML += ' (';
        wrapper.appendChild(siteSelectLink);
        wrapper.innerHTML += ') ';
    }

    setSite(site){
        this.shadowRoot.querySelector('.site_img').src = site.icon_url;
        this.shadowRoot.querySelector('.site_title').innerText = site.site_name_short;
    }
}

// Define the element
customElements.define('site-header', SiteHeader);