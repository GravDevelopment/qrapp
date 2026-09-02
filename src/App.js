import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import userManualPdf from './GG GVS USER MANUAL REV3 copy.pdf';

function App() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scannerControlsRef = useRef(null);
    const codeReaderRef = useRef(null);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back camera, 'user' = front camera
    const [serialNumber, setSerialNumber] = useState('');

    const handleSearch = () => {
        window.open(
            `https://saleshubbookingshub.blob.core.windows.net/gvs/${serialNumber}.pdf`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const handleDownloadManual = () => {
        // Trigger the download without nesting a <button> inside an <a>
        const link = document.createElement('a');
        link.href = userManualPdf;
        link.download = 'GG GVS USER MANUAL REV3.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Create the barcode reader once when the component mounts
    useEffect(() => {
        codeReaderRef.current = new BrowserMultiFormatReader();
    }, []);

    const stopScanning = () => {
        if (scannerControlsRef.current) {
            scannerControlsRef.current.stop();
            scannerControlsRef.current = null;
        }
    };

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
            streamRef.current = null;
        }
    };

    const startCamera = async (mode = facingMode) => {
        try {
            // Make sure any existing stream/scanner is fully stopped before
            // requesting a new one (needed when swapping cameras)
            stopScanning();
            stopStream();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode },
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            setCameraOpen(true);

            console.log('Camera started:', mode);

            // Continuously decode frames from the live video feed
            scannerControlsRef.current = await codeReaderRef.current.decodeFromVideoElement(
                videoRef.current,
                (result, error) => {
                    if (result) {
                        setSerialNumber(result.getText());
                        console.log('Scanned:', result.getText());

                        // Got a hit — stop scanning and close the camera automatically
                        stopScanning();
                        closeCamera();
                    }
                    // A "not found" error fires continuously while no code is in
                    // frame — that's normal, so it's ignored here rather than logged.
                }
            );
        } catch (error) {
            console.error('Camera error:', error);
            alert('Unable to access the camera.');
        }
    };

    const closeCamera = () => {
        stopScanning();
        stopStream();

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraOpen(false);

        console.log('Camera closed');
    };

    // Swap between front and back camera. If the camera feed is currently
    // open, it restarts immediately with the new camera; otherwise it just
    // remembers the preference for the next time "Open Camera" is pressed.
    const swapCamera = async () => {
        const newMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newMode);

        if (cameraOpen) {
            await startCamera(newMode);
        }
    };

    // Automatically close the camera when leaving the page
    useEffect(() => {
        return () => {
            stopScanning();
            stopStream();
        };
    }, []);

    return (
        <>
            <div>
                <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="Funny" />
            </div>

            <div id="Functions" className="App">

                {/* Download Manual */}
                <button type="button" id="downloadManualBtn" onClick={handleDownloadManual}>
                    Download User Manual
                </button>

                <br />

                {/* Camera Buttons */}
                {!cameraOpen ? (
                    <button
                        id="startCameraBtn"
                        type="button"
                        onClick={() => startCamera()}
                    >
                        Open Camera
                    </button>
                ) : (
                    <>
                        <button
                            id="closeCameraBtn"
                            type="button"
                            onClick={closeCamera}
                        >
                            Close Camera
                        </button>

                        <button
                            id="swapCameraBtn"
                            type="button"
                            onClick={swapCamera}
                        >
                            Switch to {facingMode === 'environment' ? 'Front' : 'Back'} Camera
                        </button>
                    </>
                )}

                <br />

                {/* Camera Feed */}
                <video
                    ref={videoRef}
                    id="videoFeed"
                    autoPlay
                    playsInline
                    muted
                ></video>

                <br />

                {/* Serial Number */}
                <label htmlFor="SerialNumber">
                    Please Provide the Serial Number:
                </label>

                <br />

                <input
                    type="text"
                    id="SerialNumber"
                    name="SerialNumber"
                    placeholder="Enter serial number"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                />

                <br />

                <button type="button" id="Search" onClick={handleSearch}>
                    Search
                </button>

            </div>
        </>
    );
}

export default App;