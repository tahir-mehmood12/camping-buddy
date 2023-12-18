import React, { useState, useEffect, useRef } from 'react';
import Avatar from '../Group/Avatar';
import './AvatarDropdown.style.css';

const AvatarDropdown = ({ options, defaultValue, setSelectedAssignee }) => {
  const defaultOption = options.find(f => f.member.id === (defaultValue)) || (options && options.length && options[0]);
  const [selectedValue, setSelectedValue] = useState(defaultOption);
  // setSelectedAssignee(selectedValue);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionValue) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    // setSelectedAssignee(optionValue.member?.id);
  };

  return (
    <div className="image-dropdown">
      <div
        className={`dropdown ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        ref={dropdownRef}
      >
        <div className="selected-value">
          <Avatar member={selectedValue?.member} avatarSize='small' showName={false}/>
          <span>{selectedValue?.text}</span>
          <span className={`arrow ${isOpen ? 'up' : 'down'}`}>&#9660;</span>
        </div>
        <ul className="options">
          {options.map((option, index) => (
            <li key={index} onClick={() => handleOptionClick(option)}>
              <Avatar key={index} member={option.member} avatarSize='small' showName={false}/>
              <span>{option.text}</span>
            </li>
          ))}
          {/* {
            [
              {key: 'null', member: { id: 'null' }, text: '----' },
              {key: 'unassigned', member: { id: 'unassigned' }, text: 'Unassigned' },
              {key: 'null2', member: { id: 'null' }, text: '----' },
              {key: 'add', member: { id: 'add' }, text: 'Add someone' }
            ].map(m => (
              <li key={m.key} onClick={() => handleOptionClick(m)}>
                <span>{m.text}</span>
              </li>
            ))
          } */}
        </ul>
      </div>
    </div>
  );
};

export default AvatarDropdown;
