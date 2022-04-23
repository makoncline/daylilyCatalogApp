export const validateEmail = (email: string) => {
  if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  ) {
    return "Please enter a valid email address.";
  } else {
    return null;
  }
};

export const validateConfirm = (confirm: string, password: string) => {
  console.log("validateConfirm", confirm, password);
  if (confirm && confirm !== password) {
    return "Make sure your passphrase is the same in both passphrase boxes.";
  } else {
    return null;
  }
};

export const validateUsername = (username: string) => {
  if (username.length < 2) {
    return "Username must be at least 2 characters long.";
  } else if (username.length > 24) {
    return "Username must be no more than 24 characters long.";
  } else if (!/^([a-zA-Z]|$)/.test(username)) {
    return "Username must start with a letter.";
  } else if (!/^([^_]|_[^_]|_$)*$/.test(username)) {
    return "Username must not contain two underscores next to each other.";
  } else if (!/^[a-zA-Z0-9_]*$/.test(username)) {
    return "Username must contain only alphanumeric characters and underscores.";
  } else {
    return null;
  }
};
