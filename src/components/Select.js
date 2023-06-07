import React, { useState, useRef, useEffect } from "react";

const Select = ({
  label,
  value = null,
  options = [],
  multiple = false,
  onChange = () => {}
}) => {
  const [all, setAll] = useState(false);
  const [show, setShow] = useState(false);
  const wrapperRef = useRef(null);
  const labelId = label.toLowerCase().replace(/\s+/g, "-");

  const toggleModal = () => {
    setAll(
      multiple &&
        value.sort().join(".") ===
          options
            .map((o) => o.value)
            .sort()
            .join(".")
    );
    setShow(!show);
  };

  const onAllToggle = () => {
    if (all) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
    setAll(!all);
  };

  const onItemToggle = (v) => {
    let newValue;
    if (multiple) {
      if (value.includes(v)) {
        newValue = value.filter((item) => item !== v);
      } else {
        newValue = [...value, v];
      }
    } else {
      newValue = value === v ? null : v;
    }
    setAll(
      multiple &&
        newValue.sort().join(".") ===
          options
            .map((o) => o.value)
            .sort()
            .join(".")
    );
    onChange(newValue);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      // prevent will block all other events on body, no need to do it
      // event.preventDefault()
      // event.stopPropagation()
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !wrapperRef.current.parentNode.contains(event.target)
      ) {
        setShow(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className={`select-component select-component-${labelId}`}>
      <label onClick={toggleModal} className={show ? "modal-actived" : ""}>
        {label} ▼
      </label>
      {show && (
        <div ref={wrapperRef} className="modal-wrapper">
          <h3>{label}</h3>
          <ul className={`modal-${labelId}`}>
            {multiple && (
              <li onClick={onAllToggle}>
                <input type="checkbox" checked={all} />
                All
              </li>
            )}
            {options.map((option) => (
              <li key={option.text} onClick={() => onItemToggle(option.value)}>
                <input
                  type="checkbox"
                  checked={
                    multiple
                      ? value.includes(option.value)
                      : value === option.value
                  }
                />{" "}
                {option.text}
              </li>
            ))}
          </ul>
          {/* <div className="modal-footer">
            <button onClick={() => setShow(false)}>Confirm</button>
          </div> */}
        </div>
      )}
    </div>
  );
};
export default Select;
