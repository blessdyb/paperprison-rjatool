import React from "react";

const Header = () => {
  return (
    <div className={`rja-tool-header`}>
      <a href="https://paperprisons.org/">
        <img
          src="https://paperprisons.org/images/logo.png"
          alt="Paper Prisons RJA Tool"
        />
      </a>
      <a href="https://paperprisons.org/about.html">About</a>
      <a href="https://paperprisons.org/states.html">State Reports</a>
      <a href="https://paperprisons.org/news.html">News</a>
      <a href="https://paperprisons.org/blog.html">Blog</a>
      <a href="https://paperprisons.org/diary.html">Diary</a>
    </div>
  );
};
export default Header;
