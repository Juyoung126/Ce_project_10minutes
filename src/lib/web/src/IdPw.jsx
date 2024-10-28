import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function IdPw() {
  // for input information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  // for button handler
  const [verifyCode, setVerifyCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [answerCode, setAnswerCode] = useState('');
  // for select a mode (find id/pw)
  const [isFindIdMode, setIsFindIdMode] = useState(true);
  // timer for verification code's availability
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  // for print status
  const [status, setStatus] = useState('');
  // for save admin's ID from DB
  const [yourId, setYourId] = useState('');
  // for navigate to '/newPasswd' to change the adminn's password
  const navigate = useNavigate();

  // Set Timer
  useEffect(() => {
    let timer;
    if (isTimerStarted) {
      timer = setTimeout(() => {
        setIsEmailVerified(false);
        setVerifyCode('');
        setIsTimerStarted(false);
        setTimeLeft(0);
        setStatus('시간이 지나 인증코드가 만료되었습니다. 이메일 인증을 다시 시도해주세요.');
      }, 180000);
    }
    return () => clearTimeout(timer);
  }, [isTimerStarted]);

  // Format timeLeft as "minutes:seconds"
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // 'Send Verification Email to admin'  
  const handleVerifyEmail = async () => {
    const response = await fetch('/verify', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      }
    });
    const responseText = await response.text();   // 전체 response를 text로 저장
    const responseData = JSON.parse(responseText); // JSON 문자열을 객체로 파싱

    console.log("Response Data:", responseData);

    // 이제 responseData를 변수에 저장하여 사용할 수 있음
    console.log(">>>>>> responseData.code <<<<<< :", responseData.code);
    setAnswerCode(responseData.code);
    console.log(">>>>>> answerCode <<<<<< :", answerCode);


    if (answerCode !== null) {
      setIsTimerStarted(true);
      setTimeLeft(180);
      setStatus('이메일이 전송됐습니다. 인증번호를 입력해주세요.');
    } else {
      setStatus('이메일 전송을 실패했습니다. 회원가입 시 사용한 이메일을 입력해주세요.');
    }
  };

  // 'Check Verify Code' Handler
  const handleCheckVerifyCode = () => {
    if (verifyCode === answerCode) {
      setIsEmailVerified(true);
      setIsTimerStarted(false);
      setTimeLeft(0);
      setStatus('인증번호가 일치합니다! 다음 단계를 진행해주세요.');
    } else {
      setStatus('인증번호가 일치하지 않습니다. 인증번호를 다시 확인해주세요.');
    }
  };
  // 'Find Id' bytton Handler
  const handleFindId = async () => {
    const response = await fetch('/id', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      }
    });
    const data = await response.json();
    console.log('data (in handleFindId): ', data);
    setYourId(data);
    // alert(`Your ID is ${yourId}`);
  };

  // 'Find Password' Button handler
  const handleFindPw = async () => {
    const response = await fetch('/newPasswd', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log("data (in handleFindPw) -- : ", data);
    navigate('/newPasswd');
  };

  // 'Switch Mode' Button handler
  const handleSwitchMode = () => {
    setIsFindIdMode(!isFindIdMode);
    setName('');
    setEmail('');
    setId('');
    setVerifyCode('');
    setIsEmailVerified(false);
    setAnswerCode('');
    setIsTimerStarted(false);
    setTimeLeft(0);
    setStatus('');
  };

  return (
    <div>

      <h2>{isFindIdMode ? '아이디 찾기' : '비밀번호 찾기'}</h2>
      <br />
      {/* set the mode  (find ID? : Password?) */}
      <button type="button" onClick={handleSwitchMode}>
        {isFindIdMode ? '비밀번호 찾기로 변경' : '아이디 찾기로 변경'}
      </button>
      <br />
      <form>
        <label>
          이름:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <br />
        {/* only for 'find password mode' */}
        {!isFindIdMode && (
          <label>
            아이디:
            <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
          </label>
        )}
        <br />
        <label>
          이메일:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {/* for email verify */}
        {!isEmailVerified && (
          <>
            <button type="button" onClick={handleVerifyEmail}>
              이메일 인증
            </button>
            <br /><br />
            <label>
              인증번호:
              <input type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} />
            </label>
            <button type="button" onClick={handleCheckVerifyCode} disabled={!verifyCode}>
              인증 확인
            </button>
            <br />
            {/* 인증코드 3분 타이머 시작 */}
            {isTimerStarted && (
              <>
                <p>남은 시간: {formatTimeLeft()}</p>
                <p>{status}</p>
              </>
            )}
          </>
        )}
        {/* fine 'ID' or 'PASSWORD' section */}
        {isEmailVerified && (
          <>
            <div>
              <button type="button" onClick={isFindIdMode ? handleFindId : handleFindPw}>
                {isFindIdMode ? '아이디 찾기' : '비밀번호 찾기'}
              </button>
            </div>
            <br />
            {yourId && (
              <div className="showResult">
                <p> 아이디: {yourId}</p>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
export default IdPw;

