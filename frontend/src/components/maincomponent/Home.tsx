// import React, { useEffect, useState } from "react";
import VideoList from "../videos/VideoList"; 
import VideoCardCarousel from "../videos/VideoCardCarousel"
import "./Home.css"

const VideosPage: React.FC = () => {


  return (
    <div className="videos-page">
      <div className="VideoList">
        <VideoList/>
      </div>

      <div>
        <VideoCardCarousel/>
      </div>

    </div>
  );
};

export default VideosPage;
