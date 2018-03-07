import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';
import detectElementOverflow from 'detect-element-overflow';

import Calendar from 'react-calendar/dist/entry.nostyle';
import DateInput from 'react-date-picker/dist/DateInput';

export default class DateRangePicker extends PureComponent {
  state = {
    isOpen: this.props.isOpen,
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.onClick);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onClick);
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;

    if (nextProps.isOpen !== props.isOpen) {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }

  onClick = (event) => {
    if (this.wrapper && !this.wrapper.contains(event.target)) {
      this.closeCalendar();
    }
  }

  openCalendar = () => {
    this.setState({ isOpen: true });
  }

  closeCalendar = () => {
    this.setState({ isOpen: false });
  }

  toggleCalendar = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  onChange = (value, closeCalendar = true) => {
    this.setState({
      isOpen: !closeCalendar,
    });

    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
  }

  onChangeFrom = (valueFrom, closeCalendar = true) => {
    const { value } = this.props;
    const [, valueTo] = [].concat(value);
    this.onChange([valueFrom, valueTo], closeCalendar);
  }

  onChangeTo = (valueTo, closeCalendar = true) => {
    const { value } = this.props;
    const [valueFrom] = [].concat(value);
    this.onChange([valueFrom, valueTo], closeCalendar);
  }

  onFocus = () => {
    this.openCalendar();
  }

  stopPropagation = event => event.stopPropagation()

  clear = () => this.onChange(null);

  renderInputs() {
    const {
      locale,
      maxDate,
      maxDetail,
      minDate,
      name,
      required,
      value,
    } = this.props;
    const { isOpen } = this.state;

    const [valueFrom, valueTo] = [].concat(value);

    return (
      <div className="react-daterange-picker__button">
        <DateInput
          isCalendarOpen={isOpen}
          locale={locale}
          maxDate={maxDate}
          maxDetail={maxDetail}
          minDate={minDate}
          name={`${name}_from`}
          onChange={this.onChangeFrom}
          required={required}
          returnValue="start"
          showLeadingZeros={this.props.showLeadingZeros}
          value={valueFrom}
        />
        –
        <DateInput
          isCalendarOpen={isOpen}
          locale={locale}
          maxDate={maxDate}
          maxDetail={maxDetail}
          minDate={minDate}
          name={`${name}_to`}
          onChange={this.onChangeTo}
          required={required}
          returnValue="end"
          showLeadingZeros={this.props.showLeadingZeros}
          value={valueTo}
        />
        <button
          className="react-daterange-picker__clear-button react-daterange-picker__button__icon"
          onClick={this.clear}
          onFocus={this.stopPropagation}
          type="button"
        >
          {this.props.clearIcon}
        </button>
        <button
          className="react-daterange-picker__calendar-button react-daterange-picker__button__icon"
          onClick={this.toggleCalendar}
          onFocus={this.stopPropagation}
          onBlur={this.resetValue}
          type="button"
        >
          {this.props.calendarIcon}
        </button>
      </div>
    );
  }

  renderCalendar() {
    const { isOpen } = this.state;

    if (isOpen === null) {
      return null;
    }

    const {
      calendarClassName,
      className: datePickerClassName, // Unused, here to exclude it from calendarProps
      onChange,
      value,
      ...calendarProps
    } = this.props;

    const className = 'react-daterange-picker__calendar';

    return (
      <div
        className={mergeClassNames(
          className,
          `${className}--${isOpen ? 'open' : 'closed'}`,
        )}
        ref={(ref) => {
          if (!ref) {
            return;
          }

          ref.classList.remove(`${className}--above-label`);

          const collisions = detectElementOverflow(ref, document.body);

          if (collisions.collidedBottom) {
            ref.classList.add(`${className}--above-label`);
          }
        }}
      >
        <Calendar
          className={calendarClassName}
          onChange={this.onChange}
          selectRange
          value={value || null}
          {...calendarProps}
        />
      </div>
    );
  }

  render() {
    const className = 'react-daterange-picker';

    return (
      <div
        className={mergeClassNames(
          className,
          `${className}--${this.state.isOpen ? 'open' : 'closed'}`,
          this.props.className,
        )}
        onFocus={this.onFocus}
        ref={(ref) => { this.wrapper = ref; }}
      >
        {this.renderInputs()}
        {this.renderCalendar()}
      </div>
    );
  }
}

const CalendarIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19">
    <g stroke="black" strokeWidth="2">
      <rect width="15" height="15" x="2" y="2" fill="none" />
      <line x1="6" y1="0" x2="6" y2="4" />
      <line x1="13" y1="0" x2="13" y2="4" />
    </g>
  </svg>
);

const ClearIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19">
    <g stroke="black" strokeWidth="2">
      <line x1="4" y1="4" x2="15" y2="15" />
      <line x1="15" y1="4" x2="4" y2="15" />
    </g>
  </svg>
);

DateRangePicker.defaultProps = {
  calendarIcon: CalendarIcon,
  clearIcon: ClearIcon,
  isOpen: null,
};

DateRangePicker.propTypes = {
  ...Calendar.propTypes,
  calendarClassName: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  calendarIcon: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  clearIcon: PropTypes.node,
  disabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  name: PropTypes.string,
  required: PropTypes.bool,
  showLeadingZeros: PropTypes.bool,
};
