import React from 'react';

interface FooterProps {
    companyName: string;
    projectName: string;
    onCompanyClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ companyName, projectName, onCompanyClick }) => {
    return (
        <footer className="footer">
            <div className="copyright">
                © {new Date().getFullYear()} {' '}
                <span
                    className="company-link"
                    onClick={onCompanyClick}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {companyName}
                </span> - {projectName}
            </div>
        </footer>
    );
};

export default Footer;