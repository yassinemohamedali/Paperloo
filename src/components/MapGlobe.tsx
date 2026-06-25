import React from 'react';

export default function MapGlobe() {
  // Use an iframe to safely isolate the third-party script
  // from our React application, preventing "Invalid hook call"
  // or other global namespace collisions.
  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: transparent;
          }
          /* Ensure the globe container fits */
          #mmvst_globe {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript" id="mmvst_globe" src="//mapmyvisitors.com/globe.js?d=KYHCB_WZGDLXJzBL1ZQmm_YggGam8KvalO0iV8_6VLY"></script>
      </body>
    </html>
  `;

  return (
    <div className="w-full flex justify-center my-8">
      <iframe
        title="Visitor Globe"
        srcDoc={srcDoc}
        className="w-full max-w-[300px] h-[300px] border-none bg-transparent"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
