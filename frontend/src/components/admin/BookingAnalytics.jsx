import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { format, startOfDay, startOfWeek, startOfMonth, subDays } from 'date-fns';
import {
  Card,
  Table,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
  Typography,
  Spin,
  Alert,
  Button,
  Statistic,
  Empty
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Error boundary component for catching rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Detailed error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          message="Something went wrong"
          description="We're having trouble displaying this component. Please try refreshing the page."
          type="error"
          showIcon
        />
      );
    }
    return this.props.children;
  }
}

const BookingAnalytics = () => {
  // State for filters
  const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 30)), startOfDay(new Date())]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // State for data
  const [bookings, setBookings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Format date for API requests
  const formatDateForApi = useCallback((date) => {
    return format(date, 'yyyy-MM-dd');
  }, []);

  // Fetch locations data on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        console.log('Fetching locations...');
        const response = await axios.get('/api/locations');
        setLocations(response.data.locations);
        console.log('Locations fetched:', response.data.locations);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations. Please try again later.');
      }
    };

    fetchLocations();
  }, []);

  // Fetch booking data when filters change
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        console.log('Fetching bookings with filters:', {
          dateRange: dateRange.map(formatDateForApi),
          location: selectedLocation,
          status: statusFilter,
          page: pagination.current,
          pageSize: pagination.pageSize
        });

        const response = await axios.get('/api/bookings/analytics', {
          params: {
            start_date: formatDateForApi(dateRange[0]),
            end_date: formatDateForApi(dateRange[1]),
            location_id: selectedLocation !== 'all' ? selectedLocation : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            page: pagination.current,
            per_page: pagination.pageSize
          }
        });

        console.log('Bookings data received:', response.data);
        setBookings(response.data.bookings);
        setPagination({
          ...pagination,
          total: response.data.total || response.data.bookings.length,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching booking data:', err);
        setError('Failed to load booking data. Please try again later.');
        // Provide sample data for development/testing when API fails
        setBookings(getSampleBookingData());
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [dateRange, selectedLocation, statusFilter, pagination.current, pagination.pageSize, formatDateForApi]);

  // Sample data for testing/development
  const getSampleBookingData = () => {
    return Array(20).fill().map((_, i) => ({
      id: i + 1,
      user: {
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`
      },
      slot: {
        date: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
        start_time: `${9 + Math.floor(Math.random() * 8)}:00`,
        end_time: `${10 + Math.floor(Math.random() * 8)}:00`,
      },
      location: {
        id: (i % 4) + 1,
        name: `Location ${(i % 4) + 1}`
      },
      status: ['confirmed', 'canceled', 'completed'][Math.floor(Math.random() * 3)],
      created_at: format(subDays(new Date(), Math.floor(Math.random() * 45)), 'yyyy-MM-dd HH:mm:ss')
    }));
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!bookings.length) return { today: 0, thisWeek: 0, thisMonth: 0 };

    const today = startOfDay(new Date());
    const thisWeek = startOfWeek(new Date());
    const thisMonth = startOfMonth(new Date());

    return {
      today: bookings.filter(booking =>
        new Date(booking.created_at) >= today).length,
      thisWeek: bookings.filter(booking =>
        new Date(booking.created_at) >= thisWeek).length,
      thisMonth: bookings.filter(booking =>
        new Date(booking.created_at) >= thisMonth).length
    };
  }, [bookings]);

  // Prepare data for utilization by location chart
  const locationChartData = useMemo(() => {
    if (!bookings.length) return { labels: [], datasets: [] };

    const locationCounts = bookings.reduce((acc, booking) => {
      const location = booking.location.name;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(locationCounts),
      datasets: [
        {
          label: 'Bookings by Location',
          data: Object.values(locationCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [bookings]);

  // Prepare data for booking trends over time
  const trendChartData = useMemo(() => {
    if (!bookings.length) return { labels: [], datasets: [] };

    // Group bookings by date
    const bookingsByDate = bookings.reduce((acc, booking) => {
      const date = booking.slot.date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(bookingsByDate).sort();

    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Bookings Trend',
          data: sortedDates.map(date => bookingsByDate[date]),
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
        },
      ],
    };
  }, [bookings]);

  // Prepare data for peak hours chart
  const peakHoursChartData = useMemo(() => {
    if (!bookings.length) return { labels: [], datasets: [] };

    // Group bookings by hour
    const bookingsByHour = bookings.reduce((acc, booking) => {
      const hour = booking.slot.start_time.split(':')[0];
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Create array of hours (8-17)
    const hours = Array.from({ length: 10 }, (_, i) => `${i + 8}`);

    return {
      labels: hours.map(hour => `${hour}:00`),
      datasets: [
        {
          label: 'Bookings by Hour',
          data: hours.map(hour => bookingsByHour[hour] || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    };
  }, [bookings]);

  // Table columns configuration
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong><UserOutlined /> {record.user.name}</Text>
          <Text type="secondary">{record.user.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Slot Details',
      key: 'slot',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text><CalendarOutlined /> {record.slot.date}</Text>
          <Text><ClockCircleOutlined /> {record.slot.start_time} - {record.slot.end_time}</Text>
        </Space>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <Text><EnvironmentOutlined /> {record.location.name}</Text>
      ),
      filters: locations.map(loc => ({ text: loc.name, value: loc.id })),
      onFilter: (value, record) => record.location.id === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'confirmed') color = 'blue';
        else if (status === 'completed') color = 'green';
        else if (status === 'canceled') color = 'red';

        return (
          <Button type="text" style={{ color: color === 'default' ? undefined : `var(--ant-color-${color})` }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        );
      },
      filters: [
        { text: 'Confirmed', value: 'confirmed' },
        { text: 'Completed', value: 'completed' },
        { text: 'Canceled', value: 'canceled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Booking Date',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) => format(new Date(date), 'yyyy-MM-dd HH:mm'),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    console.log('Table params changed:', { pagination, filters, sorter });
    setPagination(pagination);
  };

  return (
    <ErrorBoundary>
      <div className="booking-analytics-container" style={{ padding: '20px' }}>
        <Title level={2}>
          <BarChartOutlined /> Booking Analytics Dashboard
        </Title>

        {/* Filters section */}
        <Card title="Search Filters" style={{ marginBottom: 20 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8}>
              <div>
                <Text strong>Date Range:</Text>
                <RangePicker
                  style={{ width: '100%', marginTop: 8 }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  aria-label="Select date range"
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div>
                <Text strong>Location:</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={selectedLocation}
                  onChange={(value) => setSelectedLocation(value)}
                  aria-label="Select location filter"
                >
                  <Option value="all">All Locations</Option>
                  {locations.map(location => (
                    <Option key={location.id} value={location.id}>{location.name}</Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div>
                <Text strong>Status:</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  aria-label="Select status filter"
                >
                  <Option value="all">All Statuses</Option>
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="canceled">Canceled</Option>
                  <Option value="completed">Completed</Option>
                </Select>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Summary statistics cards */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Bookings Today"
                value={summaryStats.today}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Bookings This Week"
                value={summaryStats.thisWeek}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Bookings This Month"
                value={summaryStats.thisMonth}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Data visualization charts */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col xs={24} md={12}>
            <Card title="Bookings by Location">
              {bookings.length > 0 ? (
                <Pie
                  data={locationChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                  height={200}
                />
              ) : (
                <Empty description="No data available" />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Booking Trends">
              {bookings.length > 0 ? (
                <Line
                  data={trendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                  height={200}
                />
              ) : (
                <Empty description="No data available" />
              )}
            </Card>
          </Col>
        </Row>

        <Row style={{ marginBottom: 20 }}>
          <Col span={24}>
            <Card title="Peak Booking Hours">
              {bookings.length > 0 ? (
                <Bar
                  data={peakHoursChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                  height={200}
                />
              ) : (
                <Empty description="No data available" />
              )}
            </Card>
          </Col>
        </Row>

        {/* Bookings table */}
        <Card title="Detailed Bookings">
          {error ? (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
            />
          ) : (
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={bookings.map(booking => ({ ...booking, key: booking.id }))}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: 'No booking data available'
                }}
              />
            </Spin>
          )}
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default BookingAnalytics;
