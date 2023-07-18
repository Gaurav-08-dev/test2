import React, { useRef, useEffect } from 'react';
import "./ScreenShot.scss"

function clientYFromBottom(event) {
  var windowHeight = window.innerHeight; // Height of the viewport
  var clientYFromTop = event.clientY; // ClientY position from the top of the viewport
  
  var clientYFromBottom = windowHeight - clientYFromTop;
  
  return clientYFromBottom;
}
function clientXFromRight(event) {
  var windowWidth = window.innerWidth; // Height of the viewport
  var clientXFromLeft = event.clientX; // ClientY position from the top of the viewport
  
  var clientXFromRight = windowWidth - clientXFromLeft;
  
  return clientXFromRight;
}

const ScreenshotComponent = ({
  imageRef,
  renderImage,
  selectedImage,
  setSelectedImage,
  setImageCrop,
}) => {
  const parentRef = useRef(null);
  const ref = useRef(null);
  const refLeft = useRef(null);
  const refTop = useRef(null);
  const refRight = useRef(null);
  const refBottom = useRef(null);
  const refTopRight = useRef(null);
  const refTopLeft = useRef(null);
  const refBottomRight = useRef(null);
  const refBottomLeft = useRef(null);
  const imgRef = useRef(null);
  

  // function dataURLToBlob(dataURL) {
  //   const base64Data = dataURL.split(',')[1]; // Extract base64-encoded data
  //   const byteCharacters = atob(base64Data); // Convert base64 to byte characters
  //   const byteArrays = [];
  
  //   for (let i = 0; i < byteCharacters.length; i++) {
  //     byteArrays.push(byteCharacters.charCodeAt(i));
  //   }
  
  //   const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/png' });
  //   return blob;
  // }
  
  // function createFileWithBlob(blob, fileName, fileType, additionalInfo) {
  //   const file = new File([blob], fileName, { type: fileType });
  
  //   return file;
  // }
 

  const handleCropImage = () => {

        setImageCrop(false);
    // Get the cropped image data URL
        const childRect = ref.current.getBoundingClientRect();
        let x = childRect.left;
        let y = childRect.top;

    const croppedCanvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    const croppedContext = croppedCanvas.getContext('2d');
    croppedCanvas.width = childRect.width;
    croppedCanvas.height = childRect.height;

    const pixelRatio = window.devicePixelRatio;
    croppedCanvas.width = childRect.width * pixelRatio;
    croppedCanvas.height = childRect.height * pixelRatio;
    croppedContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    croppedContext.imageSmoothingQuality = 'high';

    croppedContext.drawImage(imgRef.current, x*scaleX, y*scaleY,childRect.width *scaleX,childRect.height * scaleY,0,0,childRect.width, childRect.height);
    const croppedImageUrl = croppedCanvas.toDataURL('image/jpeg');

    imageRef.current = croppedImageUrl;

    setSelectedImage(croppedImageUrl)

    
    setTimeout(() => {
        renderImage('', 0, 0, [])
    }, 100);

    // let blob = dataURLToBlob(croppedImageUrl);

    // const file = createFileWithBlob(blob, `screenshot-${Date.now()}.png`, 'image/png')
    // uploadFile([file], "screenshot", recordingFileFor);

    setSelectedImage("")
  };
  
  const handleSelectFullScreen = ()=>{
    setImageCrop(false)

    // let blob = dataURLToBlob(selectedImage);

    // const file = createFileWithBlob(blob, `screenshot-${Date.now()}.png`, 'image/png')
    // // uploadFile([file], "screenshot", recordingFileFor);
    
    setTimeout(() => {
        renderImage('', 0, 0, [])
    }, 100);

    setSelectedImage("");
  }


  useEffect(() => {
    if(selectedImage) {
    const resizeableEle = ref.current;
    resizeableEle.style.top = "calc(50% - 100px)";
    resizeableEle.style.left = "calc(50% - 100px)";
    const styles = window.getComputedStyle(resizeableEle);
    let width = parseInt(styles.width, 10);
    let height = parseInt(styles.height, 10);
    let x = 0;
    let y = 0;

    // Right resize
    const onMouseMoveRightResize = (event) => {
      if(clientXFromRight(event) < 0) {
        return
      }
      const dx = event.clientX - x;
      x = event.clientX;
      width = width + dx;
      resizeableEle.style.width = `${width}px`;
    };

    const onMouseUpRightResize = (event) => {
      
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      document.removeEventListener("mousemove", onMouseMoveRightResize);
    };

    const onMouseDownRightResize = (event) => {
      x = event.clientX;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.right = null;
      document.addEventListener("mousemove", onMouseMoveRightResize);
      document.addEventListener("mouseup", onMouseUpRightResize);
    };

    // Top resize
    const onMouseMoveTopResize = (event) => {
      if(event.clientY < 0 ) {
        return
      }
      const dy = event.clientY - y;
      height = height - dy;
      y = event.clientY;
      resizeableEle.style.height = `${height}px`;
    };

    const onMouseUpTopResize = (event) => {
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      document.removeEventListener("mousemove", onMouseMoveTopResize);
    };

    const onMouseDownTopResize = (event) => {
      y = event.clientY;
      const styles = window.getComputedStyle(resizeableEle);
      resizeableEle.style.bottom = styles.bottom;
      resizeableEle.style.top = null;
      document.addEventListener("mousemove", onMouseMoveTopResize);
      document.addEventListener("mouseup", onMouseUpTopResize);
    };

    // Bottom resize
    const onMouseMoveBottomResize = (event) => {
     if(clientYFromBottom(event) < 0) {
      return
     }
      const dy = event.clientY - y;
      height = height + dy;
      y = event.clientY;
      resizeableEle.style.height = `${height}px`;
    };

    const onMouseUpBottomResize = (event) => {
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      document.removeEventListener("mousemove", onMouseMoveBottomResize);
    };

    const onMouseDownBottomResize = (event) => {
      y = event.clientY;
      const styles = window.getComputedStyle(resizeableEle);
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = null;
      document.addEventListener("mousemove", onMouseMoveBottomResize);
      document.addEventListener("mouseup", onMouseUpBottomResize);
    };

    // Left resize
    const onMouseMoveLeftResize = (event) => {
      if(event.clientX < 0) return
      const dx = event.clientX - x;
      x = event.clientX;
      width = width - dx;
      resizeableEle.style.width = `${width}px`;
    };

    const onMouseUpLeftResize = (event) => {
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      document.removeEventListener("mousemove", onMouseMoveLeftResize);
    };

    const onMouseDownLeftResize = (event) => {
      x = event.clientX;
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = null;
      document.addEventListener("mousemove", onMouseMoveLeftResize);
      document.addEventListener("mouseup", onMouseUpLeftResize);
    };

    //Top Right resize
    const onMouseMoveTopRightResize = (event)=>{
      if(event.clientY < 0  || clientXFromRight(event) < 0) return
      const dx = event.clientX - x;
      x = event.clientX;
      width = width + dx;
      resizeableEle.style.width=`${width}px`;

      const dy = event.clientY - y;
      height = height - dy;
      y = event.clientY;
      resizeableEle.style.height=`${height}px`;
    }

    const onMouseUpTopRightResize = (event)=>{
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      document.removeEventListener("mousemove",onMouseMoveTopRightResize )
    }

    const onMouseDownTopRightResize = (event)=>{
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      x = event.clientX;
      y = event.clientY;
      resizeableEle.style.right = null;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = null;
      resizeableEle.style.bottom = styles.bottom;
      document.addEventListener("mousemove", onMouseMoveTopRightResize);
      document.addEventListener("mouseup", onMouseUpTopRightResize);
    }


    //Top Left resize
    const onMouseMoveTopLeftResize = (event) => {
      if(event.clientY < 0  || event.clientX < 0) return;
      const dy = event.clientY - y;
      height = height - dy;
      y = event.clientY;
      resizeableEle.style.height = `${height}px`;

      const dx = event.clientX - x;
      x = event.clientX;
      width = width - dx;
      resizeableEle.style.width = `${width}px`;
    };

    const onMouseUpTopLeftResize = (event)=>{
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      document.removeEventListener("mousemove", onMouseMoveTopLeftResize);
    }

    const onMouseDownTopLeftResize = (event)=>{
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      x = event.clientX;
      y = event.clientY;
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = null;
      resizeableEle.style.top = null;
      resizeableEle.style.bottom = styles.bottom;
      document.addEventListener("mousemove", onMouseMoveTopLeftResize);
      document.addEventListener("mouseup", onMouseUpTopLeftResize);
    }

    //Bottom Left Resize
    const onMouseMoveBottomLeftResize = (event) => {
      if(event.clientX < 0 || clientYFromBottom(event) < 0) return
      const dy = event.clientY - y;
      height = height + dy;
      y = event.clientY;
      resizeableEle.style.height = `${height}px`;

      const dx = event.clientX - x;
      x = event.clientX;
      width = width - dx;
      resizeableEle.style.width = `${width}px`;
    };

    const onMouseUpBottomLeftResize = (event)=>{
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      document.removeEventListener("mousemove", onMouseMoveBottomLeftResize);
    }

    const onMouseDownBottomLeftResize = (event)=>{
      x = event.clientX;
      y = event.clientY;
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = null;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = null;
      document.addEventListener("mousemove", onMouseMoveBottomLeftResize);
      document.addEventListener("mouseup", onMouseUpBottomLeftResize);
    }

    //Bottom Right Resize
    const onMouseMoveBottomRightResize = (event) => {
      if(clientYFromBottom(event) < 0 || clientXFromRight(event) < 0) return
      const dy = event.clientY - y;
      height = height + dy;
      y = event.clientY;
      resizeableEle.style.height = `${height}px`;

      const dx = event.clientX - x;
      x = event.clientX;
      width = width + dx;
      resizeableEle.style.width = `${width}px`;
    };

    const onMouseUpBottomRightResize = (event)=>{
      resizeableEle.style.right = styles.right;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = styles.bottom;
      document.removeEventListener("mousemove", onMouseMoveBottomRightResize);
    }

    const onMouseDownBottomRightResize = (event)=>{
      x = event.clientX;
      y = event.clientY;
      resizeableEle.style.right = null;
      resizeableEle.style.left = styles.left;
      resizeableEle.style.top = styles.top;
      resizeableEle.style.bottom = null;
      document.addEventListener("mousemove", onMouseMoveBottomRightResize);
      document.addEventListener("mouseup", onMouseUpBottomRightResize);
    }


    // Add mouse down event listener
    const resizerRight = refRight.current;
    resizerRight.addEventListener("mousedown", onMouseDownRightResize);

    const resizerTop = refTop.current;
    resizerTop.addEventListener("mousedown", onMouseDownTopResize);

    const resizerBottom = refBottom.current;
    resizerBottom.addEventListener("mousedown", onMouseDownBottomResize);

    const resizerLeft = refLeft.current;
    resizerLeft.addEventListener("mousedown", onMouseDownLeftResize);

    const resizerTopRight = refTopRight.current;
    resizerTopRight.addEventListener("mousedown",onMouseDownTopRightResize);

    const resizerTopLeft = refTopLeft.current;
    resizerTopLeft.addEventListener("mousedown",onMouseDownTopLeftResize);

    const resizerBottomLeft = refBottomLeft.current;
    resizerBottomLeft.addEventListener("mousedown",onMouseDownBottomLeftResize);

    const resizerBottomRight = refBottomRight.current;
    resizerBottomRight.addEventListener("mousedown",onMouseDownBottomRightResize);

    return () => {
      resizerRight.removeEventListener("mousedown", onMouseDownRightResize);
      resizerTop.removeEventListener("mousedown", onMouseDownTopResize);
      resizerBottom.removeEventListener("mousedown", onMouseDownBottomResize);
      resizerLeft.removeEventListener("mousedown", onMouseDownLeftResize);
      resizerTopRight.removeEventListener("mousedown",onMouseDownTopRightResize);
      resizerTopLeft.removeEventListener("mousedown", onMouseDownTopLeftResize);
      resizerBottomLeft.removeEventListener("mousedown",onMouseDownBottomLeftResize);
      resizerBottomRight.removeEventListener("mousedown", onMouseDownBottomRightResize)
    };
  }
  }, [selectedImage]);
  
  return (
    <div>
      {selectedImage && (
        <div className='main-img-container'>
          <img id='main-img' className='main-img' src={selectedImage} alt="Selected" ref={imgRef} />
          <div className='container' ref={parentRef}>
            <div ref={ref} className="resizeable">
              <div className='screenshot-btn-container'>
                <button onClick={handleCropImage} >Capture</button>
                <button onClick={handleSelectFullScreen} >Full Screen</button>
              </div>
              <div ref={refLeft} className="resizer resizer-l"></div>
              <div ref={refTop} className="resizer resizer-t"></div>
              <div ref={refRight} className="resizer resizer-r"></div>
              <div ref={refBottom} className="resizer resizer-b"></div>
              <div ref={refTopRight} className='resizer resizer-t-r'></div>
              <div ref={refTopLeft} className='resizer resizer-t-l'></div>
              <div ref={refBottomRight} className='resizer resizer-b-r'></div>
              <div ref={refBottomLeft} className='resizer resizer-b-l'></div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ScreenshotComponent;
