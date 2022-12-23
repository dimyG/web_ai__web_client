import React from 'react';

const Logo = (props) => {
  return (
    <img
      alt="Logo"
      src="/static/al_logo.png"
      width={"60px"}
      {...props}
    />
  );
}

export default Logo;
