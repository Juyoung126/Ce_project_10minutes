import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./App.css";
import "./FirstPage.css";
import DownloadIcon from '@mui/icons-material/Download';

function FirstPage() {

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      console.log('try successed')
      setIsDownloading(true);

      // 서버로부터 APK 파일의 데이터를 가져오기
      const response = await fetch('http://ceprj.gachon.ac.kr:60001/appDownload');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } console.log('fetch ok')

      // Blob 데이터를 다운로드 링크로 만들기
      const downloadUrl = window.URL.createObjectURL(await response.blob());
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.setAttribute('appDownload', 'app-release.apk');
      console.log('blob 데이터를 다운로드 링크로 만들기 성공')

      // 링크를 클릭하여 다운로드 시작
      document.body.appendChild(downloadLink);
      downloadLink.click();
      console.log('링크를 클릭하여 다운로드 시작')

      // 다운로드 후 링크 및 URL 객체 제거
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadUrl);
      console.log('다운로드 후 링크 및 url 객체 제거완료')

      setIsDownloading(false);
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
    }
  };


  return (
    <div className="firstPage-container">
      {/* Header */}
      <div className='first-header-container'>
        <div className="first-logo-block">
          <img src={"logo_2.png"} alt="로고" className="first-logo-img" />
          {/* </div>
        <div className="first-login-block"> */}
          <Link to="/login">
            <button className="login-button">관리자 로그인</button>
          </Link>
          <button onClick={handleDownload} disabled={isDownloading} className="appDownload-button">
            {isDownloading ? '다운로드 중...' : '앱 다운받기'}<DownloadIcon />
          </button>
        </div>
      </div>
      <div className='first-body-container'>
        <div clasSName="first-body-image">
          <img src={"north-ice.jpg"} alt="빙하 배경" className="first-background-img" />
        </div>
        {/* <div className='first-body-text'>
          <p>쉽고 편한 분리배출, 10분이면 충분합니다.</p>
          <p>클릭 한 번으로 '10분'의 서비스를 이용해보세요.</p>
          <button onClick={handleDownload} disabled={isDownloading} className="appDownload-button">
            {isDownloading ? '다운로드 중...' : '앱 다운받기'}<DownloadIcon />
          </button>
        </div> */}
        <div className='first-body-description'>
          <h2>AI 이미지 분류 기술을 사용한 재활용품 분리 배출 도움 및 공공 쓰레기통 위치 제공 서비스 </h2>
          <h2>공공 쓰레기통 위치 지도 제공 서비스</h2>
          <p>쉽고 편한 분리배출, 10분이면 충분합니다.</p>
          <p>클릭 한 번으로 '10분'의 서비스를 이용해보세요.</p>

          {/* <img src={"./other_image.png"} alt="something else" /> */}
        </div>
      </div>
    </div>
  );
}
export default FirstPage;
