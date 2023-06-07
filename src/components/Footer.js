import React from "react";

const Footer = () => {
  return (
    <div className="disclaimer footer">
      <a href="mailto:info@paperprisons.org">info@paperprisons.org</a>
      <p>
        A project of
        <br />
        Santa Clara University
      </p>
      <div>
        <a href="https://www.scu.edu" target="__blank">
          <img
            src="https://paperprisons.org/images/partners/scu-seal.png"
            alt="Santa Clara University"
          />
        </a>
      </div>
      <p> © 2021 Santa Clara University</p>
      <p>
        <a href="https://paperprisons.org/privacypolicy.html">Privacy Policy</a>{" "}
        |{" "}
        <a href="https://paperprisons.org/termsandconditions.html">
          Terms and Conditions
        </a>{" "}
        | <a href="https://paperprisons.org/cookiepolicy.html">Cookie Policy</a>
      </p>
    </div>
  );
};
export default Footer;
