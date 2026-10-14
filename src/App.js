import './App.css';
import React, { useState } from 'react';
import userManualPdf from './GG_GVS_USER_MANUAL_REV6 ENGLISH.pdf';
import frenchmanual from './GG_GVS_USER_MANUAL_REV5 FR.pdf';
import Derka from './Certificate Securope Quickset ZP_B054_25 EN_encrypted_.pdf';
import ENStandards from './Gravity Vertical System_REV1.4.pdf';
import logo from './New-Generic_With-Slogan 1.png';

// Add or remove entries here to change the dropdown options
const DOWNLOADS = [
    { id: 'englishmanual', label: 'English Manual / Manuel en anglais', file: userManualPdf, filename: 'GG_GVS_USER_MANUAL_REV6 ENGLISH.pdf' },
    { id: 'frenchmanual', label: 'French Manual / Manuel en français', file: frenchmanual, filename: 'GG_GVS_USER_MANUAL_REV5 FR.pdf' },
    { id: 'dekra', label: 'Dekra Certificate / Certificat Dekra', file: Derka, filename: 'Certificate Securope Quickset ZP_B054_25 EN_encrypted_.pdf' },
    { id: 'enstandards', label: 'EN Standards / Normes EN', file: ENStandards, filename: 'Gravity Vertical System_REV1.4.pdf' }
];

function App() {
    const [serialNumber, setSerialNumber] = useState('');
    const [selectedDownload, setSelectedDownload] = useState('');

    const trimmedSerial = serialNumber.trim();

    const handleSearch = (e) => {
        e.preventDefault();               // form submit (Enter key or button)
        if (!trimmedSerial) return;
        window.open(
            `https://saleshubbookingshub.blob.core.windows.net/gvs/${encodeURIComponent(trimmedSerial)}.pdf`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const handleDownloadChange = (e) => {
        const item = DOWNLOADS.find((d) => d.id === e.target.value);
        if (!item) return;

        const link = document.createElement('a');
        link.href = item.file;
        link.download = item.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset to the placeholder so the same option can be chosen again
        setSelectedDownload('');
    };

    return (
        <main className="page">
            <img src={logo} alt="Gravity Vertical System" id="Image" />

            <form id="Functions" className="App" onSubmit={handleSearch}>
                <select
                    id="downloadSelect"
                    value={selectedDownload}
                    onChange={handleDownloadChange}
                    aria-label="Download documents"
                >
                    <option value="" disabled>Download... / Télécharger...</option>
                    {DOWNLOADS.map((d) => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                </select>

                <label htmlFor="SerialNumber" id="SerialNumberFont">
                    Please provide the serial number:
                    <br />
                    Veuillez fournir le numéro de série :
                </label>

                <input
                    type="text"
                    id="SerialNumber"
                    name="SerialNumber"
                    placeholder="Serial number / Numéro de série"
                    autoComplete="off"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                />

                <button type="submit" id="Search" disabled={!trimmedSerial}>
                    Search / Rechercher
                </button>
            </form>
        </main>
    );
}
export default App;