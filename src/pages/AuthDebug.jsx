import { useState, useEffect } from 'react';

const AuthDebug = () => {
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken || '');
    
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUserInfo(payload);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const testAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/discussions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setTestResult(`Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setToken('');
    setUserInfo(null);
    setTestResult('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Authentication Debug</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9f9', borderRadius: '5px' }}>
        <h3>Current Token Status</h3>
        <p><strong>Token exists:</strong> {token ? 'Yes' : 'No'}</p>
        {token && (
          <>
            <p><strong>Token preview:</strong> {token.substring(0, 50)}...</p>
            <p><strong>Token length:</strong> {token.length} characters</p>
          </>
        )}
      </div>

      {userInfo && (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f5e8', borderRadius: '5px' }}>
          <h3>Token Payload</h3>
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
          <p><strong>Expires:</strong> {new Date(userInfo.exp * 1000).toLocaleString()}</p>
          <p><strong>Is expired:</strong> {userInfo.exp < Date.now() / 1000 ? 'Yes' : 'No'}</p>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testAuth} 
          style={{ 
            padding: '10px 20px', 
            background: '#0077cc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '3px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Test API Call
        </button>
        
        <button 
          onClick={clearToken}
          style={{ 
            padding: '10px 20px', 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Clear Token
        </button>
      </div>

      {testResult && (
        <div style={{ padding: '15px', background: '#f8f9f9', borderRadius: '5px' }}>
          <h3>Test Result</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{testResult}</pre>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
        <h3>Instructions</h3>
        <ol>
          <li>Make sure you're logged in to the main app</li>
          <li>Check if token exists and is not expired</li>
          <li>Click "Test API Call" to verify authentication</li>
          <li>If test fails, try logging out and back in</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthDebug;
