package uz.sartarosh.app.ui.bookings

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import kotlinx.coroutines.launch
import uz.sartarosh.app.R
import uz.sartarosh.app.data.repository.AuthRepository
import uz.sartarosh.app.data.repository.BookingRepository
import uz.sartarosh.app.databinding.FragmentCreateBookingBinding
import uz.sartarosh.app.util.MoneyFormatter
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

class CreateBookingFragment : Fragment() {

    private var _binding: FragmentCreateBookingBinding? = null
    private val binding get() = _binding!!

    private val args: CreateBookingFragmentArgs by navArgs()
    private val repository = BookingRepository()

    private var selectedDateTime: LocalDateTime = defaultDateTime()

    private val displayFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm", Locale.getDefault())

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentCreateBookingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        updateDateTimeLabel()

        binding.pickDateButton.setOnClickListener { showDatePicker() }
        binding.pickTimeButton.setOnClickListener { showTimePicker() }
        binding.confirmButton.setOnClickListener { submitBooking() }
    }

    private fun showDatePicker() {
        DatePickerDialog(
            requireContext(),
            { _, year, month, dayOfMonth ->
                selectedDateTime = selectedDateTime
                    .withYear(year)
                    .withMonth(month + 1)
                    .withDayOfMonth(dayOfMonth)
                clampToWorkingHours()
                updateDateTimeLabel()
            },
            selectedDateTime.year,
            selectedDateTime.monthValue - 1,
            selectedDateTime.dayOfMonth,
        ).apply {
            datePicker.minDate = System.currentTimeMillis()
        }.show()
    }

    private fun showTimePicker() {
        TimePickerDialog(
            requireContext(),
            { _, hourOfDay, minute ->
                selectedDateTime = selectedDateTime
                    .withHour(hourOfDay)
                    .withMinute(minute)
                    .withSecond(0)
                    .withNano(0)
                if (!isWithinWorkingHours(selectedDateTime)) {
                    Toast.makeText(requireContext(), R.string.outside_working_hours, Toast.LENGTH_LONG).show()
                    selectedDateTime = selectedDateTime.withHour(10).withMinute(0)
                }
                updateDateTimeLabel()
            },
            selectedDateTime.hour,
            selectedDateTime.minute,
            true,
        ).show()
    }

    private fun submitBooking() {
        if (!isWithinWorkingHours(selectedDateTime)) {
            Toast.makeText(requireContext(), R.string.outside_working_hours, Toast.LENGTH_LONG).show()
            return
        }

        val startAtIso = selectedDateTime
            .atZone(ZoneId.systemDefault())
            .toInstant()
            .toString()

        binding.confirmButton.isEnabled = false
        binding.progressBar.isVisible = true
        binding.depositInfo.isVisible = false

        viewLifecycleOwner.lifecycleScope.launch {
            repository.createBooking(
                salonId = args.salonId,
                serviceId = args.serviceId,
                barberId = args.barberId.takeIf { it.isNotBlank() },
                startAtIso = startAtIso,
            ).onSuccess { booking ->
                binding.progressBar.isVisible = false
                binding.confirmButton.isEnabled = true

                if (booking.depositAmount > 0) {
                    binding.depositInfo.text = getString(
                        R.string.deposit_required,
                        MoneyFormatter.formatUzs(booking.depositAmount),
                    )
                    binding.depositInfo.isVisible = true
                }

                Toast.makeText(requireContext(), R.string.booking_created, Toast.LENGTH_SHORT).show()
                findNavController().navigate(R.id.action_createBooking_to_bookingList)
            }.onFailure { error ->
                binding.progressBar.isVisible = false
                binding.confirmButton.isEnabled = true
                val message = when (error) {
                    is AuthRepository.ApiException -> error.message
                    else -> error.message
                }
                Toast.makeText(requireContext(), message ?: getString(R.string.booking_error), Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun updateDateTimeLabel() {
        binding.selectedDateTimeLabel.text = selectedDateTime.format(displayFormatter)
    }

    private fun clampToWorkingHours() {
        if (!isWithinWorkingHours(selectedDateTime)) {
            selectedDateTime = selectedDateTime.withHour(10).withMinute(0)
        }
    }

    private fun isWithinWorkingHours(dateTime: LocalDateTime): Boolean {
        val time = dateTime.toLocalTime()
        val open = LocalTime.of(9, 0)
        val close = LocalTime.of(20, 0)
        return !time.isBefore(open) && time.isBefore(close)
    }

    private fun defaultDateTime(): LocalDateTime =
        LocalDate.now().plusDays(1).atTime(10, 0)

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
