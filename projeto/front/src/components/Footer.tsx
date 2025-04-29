// src/components/Footer.tsx
import React from 'react';

interface FooterProps {
    companyName: string;
    projectName: string;
}

const Footer: React.FC<FooterProps> = ({ companyName, projectName }) => {
    return (
        <footer className="footer">
            <div className="copyright">
                © {new Date().getFullYear()} {companyName} - {projectName}
            </div>
        </footer>
    );
};

export default Footer;