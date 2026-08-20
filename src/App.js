import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

function App() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scannerControlsRef = useRef(null);
    const codeReaderRef = useRef(null);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [serialNumber, setSerialNumber] = useState('');

    useEffect(() => {
        codeReaderRef.current = new BrowserMultiFormatReader();
    }, []);

    const stopScanning = () => {
        if (scannerControlsRef.current) {
            scannerControlsRef.current.stop();
            scannerControlsRef.current = null;
        }
    };

    // Try to find the back/rear camera's exact device ID.
    // Falls back to null if nothing obviously "back"-labeled is found.
    const findBackCameraId = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((d) => d.kind === 'videoinput');

            // Phone browsers usually label the rear camera with
            // "back", "rear", or "environment" somewhere in the label.
            const backCamera = videoDevices.find((d) =>
                /back|rear|environment/i.test(d.label)
            );

            return backCamera ? backCamera.deviceId : null;
        } catch (error) {
            console.error('Could not enumerate devices:', error);
            return null;
        }
    };

    const startCamera = async () => {
        try {
            let stream;

            // Attempt 1: ask directly for the environment-facing camera.
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: 'environment' } },
                });
            } catch (exactError) {
                console.warn('Exact "environment" camera not available, trying fallback...', exactError);

                // Attempt 2: enumerate devices and pick one labeled as back/rear.
                // (Device labels are only populated after the first permission
                // grant, so this fallback works best on a second attempt.)
                const backCameraId = await findBackCameraId();

                if (backCameraId) {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { deviceId: { exact: backCameraId } },
                    });
                } else {
                    // Attempt 3: just ask for "environment" as a preference,
                    // not a hard requirement, and let the browser decide.
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' },
                    });
                }
            }

            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            setCameraOpen(true);
            console.log('Camera started');

            scannerControlsRef.current = await codeReaderRef.current.decodeFromVideoElement(
                videoRef.current,
                (result, error) => {
                    if (result) {
                        setSerialNumber(result.getText());
                        console.log('Scanned:', result.getText());

                        stopScanning();
                        closeCamera();
                    }
                }
            );
        } catch (error) {
            console.error('Camera error:', error);
            alert('Unable to access the camera.');
        }
    };

    const closeCamera = () => {
        stopScanning();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraOpen(false);
        console.log('Camera closed');
    };

    useEffect(() => {
        return () => {
            stopScanning();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, []);

    return (
        <>
            <div>
                <img src="logo192.png" alt="Funny" />
            </div>

            <div id="Functions" className="App">


                id="Manual"
                href="https://www.youtube.com/watch?v=Aq5WXmQQooo"
                rel="noopener noreferrer"
                target="_blank"
                >
                <button type="button">
                    Download Manual
                </button>
            </a>

            <br />

            {!cameraOpen ? (
                <button
                    id="startCameraBtn"
                    type="button"
                    onClick={startCamera}
                >
                    Open Camera
                </button>
            ) : (
                <button
                    id="closeCameraBtn"
                    type="button"
                    onClick={closeCamera}
                >
                    Close Camera
                </button>
            )}

            <br />

            <video
                ref={videoRef}
                id="videoFeed"
                autoPlay
                playsInline
                muted
            ></video>

            <br />

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

            <button type="button">
                Search
            </button>

        </div >
        </>
    );
}

export default App;