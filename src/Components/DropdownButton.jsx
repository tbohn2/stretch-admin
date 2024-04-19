import React, { useState, useEffect, useRef } from 'react';


const DropdownButton = ({ newValue, setNewValue, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleOptionSelect = (option) => {
        setNewValue(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="custom-dropdown col-2 mx-1" ref={dropdownRef}>
            <button className="custom-btn col-12" onClick={() => setIsOpen(!isOpen)}>
                {newValue}
            </button>

            {isOpen && (
                <div className="custom-dropdown-menu d-flex flex-column">
                    {options.map((option, index) => (
                        <div key={index} className="custom-dropdown-item col-12 text-center" onClick={() => handleOptionSelect(option)}>
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownButton;
