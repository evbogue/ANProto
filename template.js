export const head = async (title) => {
  return await `
<!doctype html>
<html>
  <head>
    <title>ANProto | ${title}</title>
    <link rel='stylesheet' href='./style.css' type='text/css' />
    <meta name='viewport' content='width=device-width initial-scale=1' />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">

  </head>
  <body>
    <div id='navbar'>
      <a href='/'><img src='https://wiredove.net/doveorange_sm.png' class='avatar_small' style='vertical-align: middle;'></a>
      <strong><span style="color: #fe7a00;">AN</span>Proto</strong> 
      <strong><a href='./try'>Try it</a></strong>
    </div>
`;
};

export const foot = async () => {
  return await `
  </body>
</html>
  `;
};
