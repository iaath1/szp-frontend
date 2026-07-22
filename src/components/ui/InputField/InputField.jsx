const InputField = ({ inputType = "text", placeholder, labelText, value, onChange, error }) => {
    return (
        <div className="form-group">
            <label>{labelText}</label>
            <input
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default InputField;
