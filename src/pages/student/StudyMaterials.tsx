import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Breadcrumbs,
  Link,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  Class as ClassIcon,
  InsertDriveFile as DriveIcon,
  Link as LinkIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Course {
  id: number;
  title: string;
  description: string | null;
  lecturer_id: number;
  created_at: string;
  updated_at: string;
}

interface CourseWeek {
  id: number;
  course_id: number;
  title: string;
  description: string;
  week_number: number;
  created_at?: string;
  updated_at?: string;
}

interface CourseMaterial {
  id: number;
  week_id: number;
  title: string;
  description: string;
  material_type: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

const StudyMaterials: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseWeeks, setCourseWeeks] = useState<CourseWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<CourseWeek | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseWeeks(selectedCourse.id);
    } else {
      setCourseWeeks([]);
      setSelectedWeek(null);
      setMaterials([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedWeek) {
      fetchCourseMaterials(selectedWeek.id);
    } else {
      setMaterials([]);
    }
  }, [selectedWeek]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/courses/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseWeeks = async (courseId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/course-weeks/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Sort weeks by week_number
      const sortedWeeks = response.data.sort(
        (a: CourseWeek, b: CourseWeek) => a.week_number - b.week_number
      );
      
      setCourseWeeks(sortedWeeks);
      setSelectedWeek(null);
      setError(null);
    } catch (err) {
      console.error('Error fetching course weeks:', err);
      setError('Failed to load course weeks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseMaterials = async (weekId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/course-materials/week/${weekId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching course materials:', err);
      setError('Failed to load course materials. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  const handleWeekClick = (week: CourseWeek) => {
    setSelectedWeek(week);
  };

  const handleBackToWeeks = () => {
    setSelectedWeek(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Render functions
  const renderCoursesList = () => {
    if (loading && courses.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error && courses.length === 0) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }

    const filteredCourses = courses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filteredCourses.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No courses found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Try a different search term.' : 'You are not enrolled in any courses yet.'}
          </Typography>
        </Paper>
      );
    }

    return (
      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
                cursor: 'pointer'
              }}
              onClick={() => handleCourseClick(course)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ClassIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    {course.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {course.description || 'No description available'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderWeeksList = () => {
    if (!selectedCourse) return null;

    if (loading && courseWeeks.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    const filteredWeeks = courseWeeks.filter(week => 
      week.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      week.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handleBackToCourses}
            sx={{ mr: 2 }}
          >
            Back to Courses
          </Button>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            {selectedCourse.title} - Weeks
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {filteredWeeks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No weeks found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'Try a different search term.' : 'No weeks have been added to this course yet.'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredWeeks.map((week) => (
              <Grid item xs={12} sm={6} md={4} key={week.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {week.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {week.description || 'No description available'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => handleWeekClick(week)}
                      sx={{ mr: 1 }}
                    >
                      View Materials
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const renderMaterialsList = () => {
    if (!selectedCourse || !selectedWeek) return null;

    if (loading && materials.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    const filteredMaterials = materials.filter(material => 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handleBackToWeeks}
            sx={{ mr: 2 }}
          >
            Back to Weeks
          </Button>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            {selectedCourse.title} - {selectedWeek.title}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {filteredMaterials.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No materials found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'Try a different search term.' : 'No materials have been added to this week yet.'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredMaterials.map((material) => (
              <Grid item xs={12} key={material.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {material.material_type === 'link' ? (
                        <LinkIcon color="primary" sx={{ mr: 1 }} />
                      ) : (
                        <DriveIcon color="primary" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="h6">{material.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {material.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      href={material.content}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Material
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const renderContent = () => {
    if (selectedWeek && selectedCourse) {
      return renderMaterialsList();
    } else if (selectedCourse) {
      return renderWeeksList();
    } else {
      return renderCoursesList();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Study Materials
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />
      
      {renderContent()}
    </Box>
  );
};

export default StudyMaterials;