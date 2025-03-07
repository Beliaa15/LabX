export function handleGoogleLogin(saveToken, navigate) {
    const authWindow = window.open(
      'http://127.0.0.1:5000/auth/login/google',
      '_blank',
      'width=500,height=600'
    );
  
    const messageListener = (event) => {
      if (event.origin !== 'http://127.0.0.1:5000') return;
      const { token, needsCompletion } = event.data;
      if (token) {
        saveToken(token);
        localStorage.setItem('authToken', token);
        authWindow.close();
        window.removeEventListener('message', messageListener);
        navigate(needsCompletion ? '/complete_registration' : '/profile');
      }
    };
    window.addEventListener('message', messageListener);
  }