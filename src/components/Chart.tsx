import React from 'react';
import {
  Box,
  useColorModeValue,
  Text,
  Flex,
  Select,
  HStack,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export type ChartType = 'line' | 'bar' | 'pie';

interface ChartProps {
  type: ChartType;
  data: ChartData<any>;
  title?: string;
  showLegend?: boolean;
  height?: string;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

const timeRanges = [
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
  { value: '90d', label: '90 derniers jours' },
  { value: '1y', label: '1 an' }
];

const defaultOptions: ChartOptions<'line' | 'bar' | 'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

export const Chart: React.FC<ChartProps> = ({
  type,
  data,
  title,
  showLegend = true,
  height = '300px',
  timeRange,
  onTimeRangeChange
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        ...defaultOptions.plugins?.legend,
        display: showLegend,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={options as ChartOptions<'line'>} />;
      case 'bar':
        return <Bar data={data} options={options as ChartOptions<'bar'>} />;
      case 'pie':
        return <Pie data={data} options={options as ChartOptions<'pie'>} />;
      default:
        return null;
    }
  };

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
      height={height}
    >
      {(title || timeRange) && (
        <HStack justify="space-between" mb={4}>
          {title && <Text fontSize="lg" fontWeight="bold">{title}</Text>}
          {timeRange && onTimeRangeChange && (
            <Select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              width="auto"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Select>
          )}
        </HStack>
      )}
      <Box height={height}>
        {renderChart()}
      </Box>
    </Box>
  );
};

export default Chart; 