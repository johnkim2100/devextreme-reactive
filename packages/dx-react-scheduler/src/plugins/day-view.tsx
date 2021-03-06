import * as React from 'react';
import {
  Template,
  Plugin,
  TemplateConnector,
  TemplatePlaceholder,
  PluginComponents,
  Getter,
} from '@devexpress/dx-react-core';
import {
  viewCellsData as viewCellsDataCore,
  calculateWeekDateIntervals,
  VIEW_TYPES,
  getTimeTableHeight,
  timeCellsData as timeCellsDataCore,
  computed,
} from '@devexpress/dx-scheduler-core';
import { memoize } from '@devexpress/dx-core';
import { BasicView } from './basic-view';
import { VerticalViewProps } from '../types';

const viewCellsDataBaseComputed = (
  cellDuration, startDayHour, endDayHour,
) => ({ currentDate, intervalCount }) => {
  return viewCellsDataCore(
    currentDate, undefined,
    intervalCount, [],
    startDayHour!, endDayHour!, cellDuration!,
    Date.now(),
  );
};
const calculateAppointmentsIntervalsBaseComputed = cellDuration => ({
  appointments, startViewDate, endViewDate, excludedDays,
}) => calculateWeekDateIntervals(
  appointments, startViewDate, endViewDate, excludedDays, cellDuration,
);
const timeCellsDataComputed = (startDayHour, endDayHour) => ({
  viewCellsData, cellDuration,
}) => timeCellsDataCore(viewCellsData, startDayHour, endDayHour, cellDuration, Date.now());

const TimeScalePlaceholder = () => <TemplatePlaceholder name="timeScale" />;

class DayViewBase extends React.PureComponent<VerticalViewProps> {
  static defaultProps: Partial<VerticalViewProps> = {
    name: 'Day',
    startDayHour: 0,
    endDayHour: 24,
    cellDuration: 30,
    intervalCount: 1,
  };

  static components: PluginComponents = {
    layoutComponent: 'Layout',
    layoutContainer: 'LayoutContainer',
    appointmentLayerComponent: 'AppointmentLayer',
    dayScaleEmptyCellComponent: 'DayScaleEmptyCell',
    timeScaleLayoutComponent: 'TimeScaleLayout',
    timeScaleLabelComponent: 'TimeScaleLabel',
    timeScaleTickCellComponent: 'TimeScaleTickCell',
    timeScaleTicksRowComponent: 'TimeScaleTicksRow',
    dayScaleLayoutComponent: 'DayScaleLayout',
    dayScaleCellComponent: 'DayScaleCell',
    dayScaleRowComponent: 'DayScaleRow',
    timeTableContainerComponent: 'TimeTableContainer',
    timeTableLayoutComponent: 'TimeTableLayout',
    timeTableCellComponent: 'TimeTableCell',
    timeTableRowComponent: 'TimeTableRow',
  };

  timeCellsDataComputed = memoize((viewName, startDayHour, endDayHour) => getters => computed(
    getters,
    viewName,
    timeCellsDataComputed(startDayHour, endDayHour),
    getters.timeCellsData,
  ));

  render() {
    const {
      layoutComponent,
      dayScaleEmptyCellComponent: DayScaleEmptyCell,
      timeScaleLayoutComponent: TimeScale,
      timeScaleLabelComponent: TimeScaleLabel,
      timeScaleTickCellComponent,
      timeScaleTicksRowComponent,
      dayScaleLayoutComponent,
      dayScaleCellComponent,
      dayScaleRowComponent,
      timeTableLayoutComponent,
      timeTableRowComponent,
      timeTableCellComponent,
      appointmentLayerComponent,
      cellDuration,
      name: viewName,
      intervalCount,
      displayName,
      startDayHour,
      endDayHour,
    } = this.props;

    return (
      <Plugin
        name="DayView"
      >
        <BasicView
          viewCellsDataComputed={viewCellsDataBaseComputed}
          type={VIEW_TYPES.DAY}
          cellDuration={cellDuration}
          name={viewName}
          intervalCount={intervalCount}
          displayName={displayName}
          startDayHour={startDayHour}
          endDayHour={endDayHour}
          calculateAppointmentsIntervals={calculateAppointmentsIntervalsBaseComputed}
          dayScaleEmptyCellComponent={DayScaleEmptyCell}
          dayScaleLayoutComponent={dayScaleLayoutComponent}
          dayScaleCellComponent={dayScaleCellComponent}
          dayScaleRowComponent={dayScaleRowComponent}
          timeTableCellComponent={timeTableCellComponent}
          timeTableLayoutComponent={timeTableLayoutComponent}
          timeTableRowComponent={timeTableRowComponent}
          appointmentLayerComponent={appointmentLayerComponent}
          layoutComponent={layoutComponent}
          layoutProps={{
            timeScaleComponent: TimeScalePlaceholder,
          }}
        />

        <Getter
          name="timeCellsData"
          computed={this.timeCellsDataComputed(viewName, startDayHour, endDayHour)}
        />

        <Template name="timeScale">
          {(params: any) => (
            <TemplateConnector>
              {({
                currentView, timeCellsData, groups, formatDate,
                groupOrientation: getGroupOrientation,
                timeTableElementsMeta,
              }) => {
                if (currentView.name !== viewName) return <TemplatePlaceholder />;
                const groupOrientation = getGroupOrientation?.(viewName);

                return (
                  <TimeScale
                    labelComponent={TimeScaleLabel}
                    tickCellComponent={timeScaleTickCellComponent}
                    rowComponent={timeScaleTicksRowComponent}
                    cellsData={timeCellsData}
                    formatDate={formatDate}
                    groups={groups}
                    groupOrientation={groupOrientation}
                    height={getTimeTableHeight(timeTableElementsMeta)}
                    {...params}
                  />
                );
              }}
            </TemplateConnector>
          )}
        </Template>
      </Plugin >
    );
  }
}

// tslint:disable-next-line: max-line-length
/*** A plugin that renders Scheduler data for a day. This plugin arranges appointments from top to bottom.
 * If their time intervals overlap, their width is decreased and they are placed next to each other.
 * */
export const DayView: React.ComponentType<VerticalViewProps> = DayViewBase;
