package uz.sartarosh.app.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavOptions
import androidx.navigation.fragment.findNavController
import kotlinx.coroutines.launch
import uz.sartarosh.app.R
import uz.sartarosh.app.SartaroshApp
import uz.sartarosh.app.data.model.UserProfile
import uz.sartarosh.app.data.model.displayName
import uz.sartarosh.app.data.repository.UserRepository
import uz.sartarosh.app.databinding.DialogEditNameBinding
import uz.sartarosh.app.databinding.FragmentProfileBinding
import java.text.SimpleDateFormat
import java.util.Locale

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private val sessionManager get() = SartaroshApp.instance.sessionManager
    private val userRepository = UserRepository()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        renderCachedUser()
        loadProfile()

        binding.swipeRefresh.setOnRefreshListener { loadProfile() }
        binding.editNameButton.setOnClickListener { showEditNameDialog() }
        binding.logoutButton.setOnClickListener { confirmLogout() }
    }

    private fun renderCachedUser() {
        val phone = sessionManager.userPhone
        binding.phoneValue.text = phone ?: getString(R.string.profile_phone_unknown)
        binding.phoneValueRow.text = phone ?: getString(R.string.profile_phone_unknown)
        binding.avatarInitial.text = (phone?.lastOrNull())?.toString() ?: "S"
        binding.displayName.text = getString(R.string.profile_name_default)
    }

    private fun loadProfile() {
        binding.swipeRefresh.isRefreshing = true
        binding.progressBar.isVisible = true

        viewLifecycleOwner.lifecycleScope.launch {
            userRepository.getMyProfile()
                .onSuccess { profile -> bindProfile(profile) }
                .onFailure { error ->
                    Toast.makeText(
                        requireContext(),
                        error.message ?: getString(R.string.profile_load_error),
                        Toast.LENGTH_SHORT,
                    ).show()
                }
            binding.swipeRefresh.isRefreshing = false
            binding.progressBar.isVisible = false
        }
    }

    private fun bindProfile(profile: UserProfile) {
        if (_binding == null) return

        binding.displayName.text = profile.displayName()
        binding.phoneValue.text = profile.phone
        binding.phoneValueRow.text = profile.phone
        binding.avatarInitial.text = (profile.firstName?.firstOrNull() ?: profile.phone.lastOrNull())
            ?.uppercaseChar()?.toString() ?: "S"

        profile.stats?.let { stats ->
            binding.statBookings.text = stats.totalBookings.toString()
            binding.statCompleted.text = stats.completedBookings.toString()
            binding.statReviews.text = stats.reviewsCount.toString()
            binding.memberSince.text = formatDate(stats.memberSince)
        }
    }

    private fun formatDate(iso: String): String {
        return runCatching {
            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val date = parser.parse(iso.substringBefore("."))
            SimpleDateFormat("dd MMM yyyy", Locale.getDefault()).format(date!!)
        }.getOrDefault(iso)
    }

    private fun showEditNameDialog() {
        val dialogBinding = DialogEditNameBinding.inflate(LayoutInflater.from(requireContext()))
        val cached = sessionManager.getUser()
        dialogBinding.firstNameInput.setText(cached?.firstName.orEmpty())
        dialogBinding.lastNameInput.setText(cached?.lastName.orEmpty())

        AlertDialog.Builder(requireContext())
            .setTitle(R.string.profile_edit_dialog_title)
            .setView(dialogBinding.root)
            .setPositiveButton(R.string.profile_save) { _, _ ->
                val firstName = dialogBinding.firstNameInput.text?.toString()?.trim().orEmpty()
                val lastName = dialogBinding.lastNameInput.text?.toString()?.trim().orEmpty()
                saveName(firstName.ifBlank { null }, lastName.ifBlank { null })
            }
            .setNegativeButton(R.string.profile_cancel, null)
            .show()
    }

    private fun saveName(firstName: String?, lastName: String?) {
        binding.progressBar.isVisible = true
        viewLifecycleOwner.lifecycleScope.launch {
            userRepository.updateProfile(firstName, lastName)
                .onSuccess {
                    loadProfile()
                    Toast.makeText(requireContext(), R.string.profile_updated, Toast.LENGTH_SHORT).show()
                }
                .onFailure { error ->
                    Toast.makeText(
                        requireContext(),
                        error.message ?: getString(R.string.profile_load_error),
                        Toast.LENGTH_SHORT,
                    ).show()
                }
            binding.progressBar.isVisible = false
        }
    }

    private fun confirmLogout() {
        AlertDialog.Builder(requireContext())
            .setTitle(R.string.profile_logout)
            .setMessage(R.string.profile_logout_confirm)
            .setPositiveButton(R.string.profile_logout) { _, _ -> performLogout() }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    private fun performLogout() {
        sessionManager.clear()
        Toast.makeText(requireContext(), R.string.profile_logout_success, Toast.LENGTH_SHORT).show()
        findNavController().navigate(
            R.id.loginFragment,
            null,
            NavOptions.Builder()
                .setPopUpTo(R.id.nav_graph, true)
                .build(),
        )
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
