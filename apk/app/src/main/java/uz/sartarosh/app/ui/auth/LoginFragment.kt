package uz.sartarosh.app.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.view.isVisible
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import kotlinx.coroutines.launch
import uz.sartarosh.app.R
import uz.sartarosh.app.SartaroshApp
import uz.sartarosh.app.data.repository.AuthRepository
import uz.sartarosh.app.databinding.FragmentLoginBinding

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val authRepository = AuthRepository()
    private var isLoading = false

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        if (SartaroshApp.instance.sessionManager.isLoggedIn) {
            findNavController().navigate(R.id.action_loginFragment_to_salonListFragment)
            return
        }

        binding.sendOtpButton.setOnClickListener { sendOtp() }
        binding.verifyButton.setOnClickListener { verifyOtp() }

        binding.otpInput.doAfterTextChanged {
            binding.otpInputLayout.error = null
        }
        binding.phoneInput.doAfterTextChanged {
            binding.phoneInputLayout.error = null
        }
    }

    private fun sendOtp() {
        val phone = binding.phoneInput.text?.toString()?.trim().orEmpty()
        if (!isValidPhone(phone)) {
            binding.phoneInputLayout.error = getString(R.string.login_error_phone)
            return
        }

        setLoading(true)
        viewLifecycleOwner.lifecycleScope.launch {
            authRepository.sendOtp(phone)
                .onSuccess { data ->
                    showDebugOtp(data.debugOtp)
                    Toast.makeText(
                        requireContext(),
                        getString(R.string.login_otp_sent, data.expiresInSeconds),
                        Toast.LENGTH_SHORT,
                    ).show()
                }
                .onFailure { error ->
                    showError(error.message ?: getString(R.string.login_error_generic))
                }
            setLoading(false)
        }
    }

    private fun verifyOtp() {
        val phone = binding.phoneInput.text?.toString()?.trim().orEmpty()
        val otp = binding.otpInput.text?.toString()?.trim().orEmpty()

        if (!isValidPhone(phone)) {
            binding.phoneInputLayout.error = getString(R.string.login_error_phone)
            return
        }
        if (!OTP_PATTERN.matches(otp)) {
            binding.otpInputLayout.error = getString(R.string.login_error_otp)
            return
        }

        setLoading(true)
        viewLifecycleOwner.lifecycleScope.launch {
            authRepository.verifyOtp(phone, otp)
                .onSuccess {
                    findNavController().navigate(R.id.action_loginFragment_to_salonListFragment)
                }
                .onFailure { error ->
                    showError(error.message ?: getString(R.string.login_error_generic))
                }
            setLoading(false)
        }
    }

    private fun showDebugOtp(debugOtp: String?) {
        val visible = !debugOtp.isNullOrBlank()
        binding.debugOtpCard.isVisible = visible
        binding.debugOtpLabel.isVisible = visible
        binding.debugOtpValue.isVisible = visible
        binding.debugOtpValue.text = debugOtp.orEmpty()
    }

    private fun showError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
    }

    private fun setLoading(loading: Boolean) {
        isLoading = loading
        binding.loadingIndicator.isVisible = loading
        binding.sendOtpButton.isEnabled = !loading
        binding.verifyButton.isEnabled = !loading
        binding.phoneInput.isEnabled = !loading
        binding.otpInput.isEnabled = !loading
    }

    private fun isValidPhone(phone: String): Boolean = PHONE_PATTERN.matches(phone)

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private val PHONE_PATTERN = Regex("^\\+[1-9]\\d{7,14}$")
        private val OTP_PATTERN = Regex("^\\d{6}$")
    }
}
