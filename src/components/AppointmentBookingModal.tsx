import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { RealWorldDoctor } from '../data/patientConsultationData';

interface AppointmentBookingModalProps {
  open: boolean;
  doctor: RealWorldDoctor | null;
  onClose: () => void;
  patientSymptomSummary: string;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  open,
  doctor,
  onClose,
  patientSymptomSummary,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string>('Today at 2:30 PM');
  const [consultType, setConsultType] = useState<'in_clinic' | 'telehealth'>('in_clinic');
  const [patientName, setPatientName] = useState<string>('Alex Morgan');
  const [patientPhone, setPatientPhone] = useState<string>('(555) 392-1084');
  const [notes, setNotes] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [confirmationCode, setConfirmationCode] = useState<string>('');

  if (!doctor) return null;

  const availableSlots = [
    doctor.nextSlot,
    'Today at 4:15 PM',
    'Tomorrow at 10:00 AM',
    'Tomorrow at 2:30 PM',
    'Thursday at 11:15 AM',
  ];

  const handleConfirm = () => {
    const code = 'BFLY-' + Math.floor(100000 + Math.random() * 900000);
    setConfirmationCode(code);
    setIsConfirmed(true);
  };

  const handleResetModal = () => {
    setIsConfirmed(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#f0fdfa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d9488',
            }}
          >
            <CalendarMonthIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {isConfirmed ? 'Appointment Confirmed!' : 'Connect with Your Doctor'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {!isConfirmed ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Doctor Info Card */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                gap: 2,
                alignItems: 'center',
              }}
            >
              <Avatar
                src={doctor.avatarUrl}
                alt={doctor.name}
                sx={{ width: 64, height: 64, border: '2px solid #0d9488' }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {doctor.name}
                  </Typography>
                  <Chip
                    label={`★ ${doctor.rating} (${doctor.reviewCount})`}
                    size="small"
                    sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, height: 20 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 700 }}>
                  {doctor.title}
                </Typography>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mt: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 14 }} /> {doctor.clinicName} • {doctor.distance}
                </Typography>
              </Box>
            </Box>

            {/* Visit Type */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                1. Choose Visit Mode
              </Typography>
              <RadioGroup
                row
                value={consultType}
                onChange={(e) => setConsultType(e.target.value as any)}
                sx={{ mt: 1, gap: 1.5 }}
              >
                <Box
                  onClick={() => setConsultType('in_clinic')}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1.5px solid',
                    borderColor: consultType === 'in_clinic' ? '#0d9488' : '#e2e8f0',
                    bgcolor: consultType === 'in_clinic' ? '#f0fdfa' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <LocalHospitalIcon sx={{ color: consultType === 'in_clinic' ? '#0d9488' : 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      In-Clinic Visit
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Diagnostic exam & x-ray
                    </Typography>
                  </Box>
                </Box>

                {doctor.telehealthAvailable && (
                  <Box
                    onClick={() => setConsultType('telehealth')}
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: 2,
                      border: '1.5px solid',
                      borderColor: consultType === 'telehealth' ? '#0d9488' : '#e2e8f0',
                      bgcolor: consultType === 'telehealth' ? '#f0fdfa' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <VideoCameraFrontIcon sx={{ color: consultType === 'telehealth' ? '#0d9488' : 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Video Consult
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Live prescription & triage
                      </Typography>
                    </Box>
                  </Box>
                )}
              </RadioGroup>
            </Box>

            {/* Select Slot */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                2. Select Earliest Available Slot
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {availableSlots.map((slot, i) => (
                  <Chip
                    key={i}
                    label={slot}
                    clickable
                    color={selectedSlot === slot ? 'primary' : 'default'}
                    variant={selectedSlot === slot ? 'filled' : 'outlined'}
                    onClick={() => setSelectedSlot(slot)}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Patient Details */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                3. Patient Contact & Notes
              </Typography>
              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Full Name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mobile Phone"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    label="Note for Doctor / Symptoms"
                    placeholder="e.g. Pain worse on chewing, allergic to penicillin"
                    defaultValue={patientSymptomSummary}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>

            <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.825rem' }}>
              <strong>Zero-Waiting Priority:</strong> By booking through Butterfly Clinic Care Navigation, your triage intake questionnaire and symptom profile are automatically sent ahead to {doctor.name}.
            </Alert>
          </Box>
        ) : (
          /* Confirmation Screen */
          <Box sx={{ py: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 44 }} />
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                You're All Set, {patientName}!
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Your appointment with <strong>{doctor.name}</strong> is reserved.
              </Typography>
            </Box>

            <Box
              sx={{
                width: '100%',
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                textAlign: 'left',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  CONFIRMATION ID
                </Typography>
                <Chip label={confirmationCode} color="primary" size="small" sx={{ fontWeight: 800, fontFamily: 'monospace' }} />
              </Box>

              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedSlot}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {consultType === 'in_clinic' ? 'In-Person Consultation' : 'Secure HD Video Telehealth'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocationOnIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {doctor.clinicName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {doctor.address}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PhoneIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Direct Reception: {doctor.phone}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              An SMS confirmation & calendar link have been dispatched to <strong>{patientPhone}</strong>.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        {!isConfirmed ? (
          <>
            <Button onClick={onClose} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button onClick={handleConfirm} variant="contained" color="primary" sx={{ fontWeight: 700, px: 3 }}>
              Confirm Booking & Send Profile
            </Button>
          </>
        ) : (
          <Button onClick={handleResetModal} variant="contained" color="primary" fullWidth sx={{ fontWeight: 700 }}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
