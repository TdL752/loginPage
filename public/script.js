// buttons
const loginBtn = document.getElementById('login-button');
const registerBtn = document.getElementById('register-account');

// inputs
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const confirmInput = document.getElementById('confirm-password-input');

// fail messages
const accountFailMsg = document.getElementById('account-fail');
const passwordMatchFail = document.getElementById('password-match');
const usernameFail = document.getElementById('username-fail');
const allMsg = document.querySelectorAll('.fail-message');

// input variables
let username;
let password;
let confirmPassword;

// function to send username and password to backend for validation
async function loginFunction() {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // if response.ok is false console log response
        if (!response.ok) {
            throw new Error(`login failed: ${response.status}`);
            accountFailMsg.classList.toggle('hidden');
        };

        const data = await response.json();

        // console log for validation
        console.log(data);

        // backend returns a message only if successful
        // on success hide login page and show success message for 1 second
        // redirect to tokenized home page
        if (data.message) {
            document.getElementById('field').style.display = 'none';
            document.getElementById('success').classList.toggle('hidden');
            setTimeout(() => {
                window.location.href = '/home';
            }, 1000);
        };
    // catch error and show fail message
    } catch (err) {
        console.error('Error: ', err);
        accountFailMsg.classList.toggle('hidden');
    };
};

// function to register a new account
// sends credentials to backend to store in database
async function register() {
    if(password !== confirmPassword) {
	console.error('Passwords do not match');
        passwordMatchFail.classList.toggle('hidden');
        return;
    };

    try {
	    const response = await fetch('/api/register', {
		    method: 'POST',
		    headers: { 'Content-type': 'application/json' },
		    body: JSON.stringify({ username, password })
	    });

	    const data = await response.json();
	    console.log(data);

	    if (response.status === 409) {
		    usernameFail.classList.toggle('hidden');
            // Username taken
		    return;
	    };

	    if (!response.ok) {
		    //account registration fail
            accountFailMsg.classList.toggle('hidden');
		    return;
	    };

        // on success hide login page and show success message for 1 second
        // redirect to tokenized home page
	    if (data.message) {
		    document.getElementById('field').style.display = 'none';
		    document.getElementById('success').style.display = 'block';

		    setTimeout(() => {
			    window.location.href = '/home';
		    }, 1000);
	    };
    } catch (err) {
	    console.error('Error: ', err);
        accountFailMsg.classList.toggle('hidden');
	    //account registration fail
    };
};
	

// check if buttons are in DOM first to prevent compiling errors

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        // reset all fail messages on button click
        allMsg.forEach(msg => {
            msg.classList.add('hidden');
        });

        // asign values on button click
        username = usernameInput.value;
        password = passwordInput.value;

        loginFunction();
    });
};

if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        // reset all fail messages on button click
        allMsg.forEach(msg => {
            msg.classList.add('hidden');
        });

        // asign values on button click
        username = usernameInput.value;
        password = passwordInput.value;
        confirmPassword = confirmInput.value;

        register();
    });
};


