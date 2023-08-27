import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const AnnotationTool = () => {
  const images = [
    'src/images/image_1.jpg',
    'src/images/image_2.jpg',
    'src/images/image_3.jpg',
    'src/images/image_4.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [boundingBoxes, setBoundingBoxes] = useState({});

  const canvasRef = useRef(null);
  const [drawingBox, setDrawingBox] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (boundingBoxes[images[currentImageIndex]]) {
      boundingBoxes[images[currentImageIndex]].forEach((bbox) => {
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);
      });
    }

    if (drawingBox) {
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.strokeRect(drawingBox.x1, drawingBox.y1, drawingBox.x2 - drawingBox.x1, drawingBox.y2 - drawingBox.y1);
    }
  }, [currentImageIndex, boundingBoxes, drawingBox]);


  useEffect(() => {
    // Load saved annotations if available
    const savedAnnotations = localStorage.getItem('annotations');
    if (savedAnnotations) {
      setAnnotations(JSON.parse(savedAnnotations));
    }
  }, []);

  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawingBox({ x1: x, y1: y, x2: x, y2: y });
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawingBox((prevBox) => ({ ...prevBox, x2: x, y2: y }));
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !drawingBox) return;

    setBoundingBoxes((prevBoxes) => ({
      ...prevBoxes,
      [images[currentImageIndex]]: [...(prevBoxes[images[currentImageIndex]] || []), drawingBox],
    }));

    setIsDrawing(false);
    setDrawingBox(null);
  };

  const handleSaveButtonClick = () => {
    // Save bounding boxes to a backend or local storage
    setAnnotations((prevAnnotations) => ({
      ...prevAnnotations,
      [images[currentImageIndex]]: boundingBoxes[images[currentImageIndex]] || [],
    }));
    localStorage.setItem('annotations', JSON.stringify(annotations));
  };

  const handleDownloadButtonClick = () => {
    // Prepare annotation data in JSON format
    const annotationData = JSON.stringify(boundingBoxes);

    // Create a Blob containing the JSON data
    const blob = new Blob([annotationData], { type: 'application/json' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link and simulate a click to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.json';
    a.click();
  };

  return (
    <div className="annotation-tool">
      <div className="image-container">
        <img src={images[currentImageIndex]} alt={`Image ${currentImageIndex}`} />
        <canvas
          ref={canvasRef}
          width={800} // Set a fixed width for the canvas
          height={600} // Set a fixed height for the canvas
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        />
      </div>

      <div className="controls">
        <button
          onClick={() => setCurrentImageIndex(prevIndex => Math.max(0, prevIndex - 1))}
          disabled={currentImageIndex === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentImageIndex(prevIndex => Math.min(images.length - 1, prevIndex + 1))}
          disabled={currentImageIndex === images.length - 1}
        >
          Next
        </button>
      </div>

      <div className="buttons-container">
        <button className="save-button" onClick={handleSaveButtonClick}>Save</button>
        <button className="download-button" onClick={handleDownloadButtonClick}>Submit</button>
      </div>
    </div>
  );
};

export default AnnotationTool;
