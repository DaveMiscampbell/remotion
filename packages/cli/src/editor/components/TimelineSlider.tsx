import React, {useMemo} from 'react';
import {useTimelinePosition, useVideoConfig} from 'remotion';
import styled from 'styled-components';
import {
	TIMELINE_LEFT_PADDING,
	TIMELINE_RIGHT_PADDING,
} from '../helpers/timeline-layout';
import {useWindowSize} from '../hooks/use-window-size';
import {TimelineSliderHandle} from './TimelineSliderHandle';

const Line = styled.div`
	height: 400px;
	width: 1px;
	background-color: #f02c00;
	position: absolute;
	top: 0;
`;

export const TimelineSlider: React.FC = () => {
	const timelinePosition = useTimelinePosition();
	const videoConfig = useVideoConfig();
	const {width} = useWindowSize();

	const left = useMemo(() => {
		if (!videoConfig.durationInFrames) {
			return 0;
		}
		return (
			(timelinePosition / videoConfig.durationInFrames) *
				(width - TIMELINE_LEFT_PADDING - TIMELINE_RIGHT_PADDING - 1) +
			TIMELINE_LEFT_PADDING
		);
	}, [timelinePosition, videoConfig.durationInFrames, width]);

	if (!videoConfig) {
		return null;
	}

	return (
		<Line
			style={{
				left,
			}}
		>
			<TimelineSliderHandle />
		</Line>
	);
};
