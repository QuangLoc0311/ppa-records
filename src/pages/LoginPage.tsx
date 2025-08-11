import { useState } from 'react';
import { authService } from '../services/authService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRequestCode = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setMessage('');
    
    const result = await authService.requestCode(email);
    setMessage(result.message);
    
    if (result.success) {
      setStep('code');
    }
    
    setIsLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!code) return;
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const authResponse = await authService.verifyCode(email, code);
      authService.storeAuth(authResponse.token, authResponse.user);
      setMessage('Login successful! Redirecting...');
      
      // Redirect to main app
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Verification failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {step === 'email' ? 'Enter Your Email' : 'Enter Verification Code'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'email' ? (
            <>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                onClick={handleRequestCode} 
                disabled={isLoading || !email}
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Send Code'}
              </Button>
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                maxLength={6}
              />
              <Button 
                onClick={handleVerifyCode} 
                disabled={isLoading || !code}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setStep('email')}
                className="w-full"
              >
                Back to Email
              </Button>
            </>
          )}
          
          {message && (
            <p className={`text-sm text-center ${
              message.includes('successful') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;