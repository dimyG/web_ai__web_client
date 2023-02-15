import React from 'react';

const Logo = (props) => {
  return (
    <img
      alt="Logo"
      src="/static/logo-no-background.png"
      width={"60px"}
      {...props}
    />
  );
}

export default Logo;
