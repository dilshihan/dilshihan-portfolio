import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          Education <span>&</span>
          <br /> Journey
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Higher Secondary Education</h4>
                <h5>national english medium school chemmad</h5>
              </div>
              <h3>2022</h3>
            </div>
            <p>
              I completed my higher secondary education with a focus on commerce and mathematics,
              where I built a strong analytical and problem-solving foundation. During this time,
              I actively participated in various technical and academic activities, which sparked
              my early interest in computers and technology and motivated me to pursue a career
              in the field of software development
            </p>
          </div>

          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Full Stack Development Learner</h4>
                <h5>Self-Taught & Bootcamps</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Actively building responsive web applications and personal
              projects using React.js, Node.js, and modern web technologies.
              Continuously learning best practices in UI/UX design and backend
              architecture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
